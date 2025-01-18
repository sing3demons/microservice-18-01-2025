package ms

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/IBM/sarama"
)

type ConsumerGroupHandler struct {
	cfg   KafkaConfig
	h     ServiceHandleFunc
	topic string
}

func (handler *ConsumerGroupHandler) Setup(sarama.ConsumerGroupSession) error {
	return nil
}
func (handler *ConsumerGroupHandler) Cleanup(sarama.ConsumerGroupSession) error {
	return nil
}

func (handler *ConsumerGroupHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		// set context
		ctx := NewConsumerContext(&handler.cfg, msg)
		if err := handler.h(ctx); err != nil {
			// log error
			log.Printf("error: %v", err)
			return err
		}
		session.MarkMessage(msg, "")
	}
	return nil
}

func newConsumer(brokers []string, groupID string) (sarama.ConsumerGroup, error) {
	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.NewBalanceStrategyRange()
	config.Consumer.Offsets.Initial = sarama.OffsetOldest
	config.Version = sarama.V2_5_0_0 // Set to Kafka version used

	client, err := sarama.NewConsumerGroup(brokers, groupID, config)

	if err != nil {
		log.Println("Error creating consumer group client: ", err)
		return nil, err
	}

	return client, nil
}

func toggleConsumptionFlow(client sarama.ConsumerGroup, isPaused *bool) {
	if *isPaused {
		client.ResumeAll()
		fmt.Println("Resuming consumption")
	} else {
		client.PauseAll()
		fmt.Println("Pausing consumption")
	}

	*isPaused = !*isPaused
}

func consume(kafkaConfig *KafkaConfig, topic string, h ServiceHandleFunc) error {
	if kafkaConfig.client == nil {
		if kafkaConfig.Brokers == nil {
			return fmt.Errorf("kafka brokers not set")
		}

		if kafkaConfig.GroupID == "" {
			return fmt.Errorf("kafka group id not set")
		}

		client, err := newConsumer(kafkaConfig.Brokers, kafkaConfig.GroupID)
		if err != nil {
			return err
		}

		kafkaConfig.client = client
	}

	defer kafkaConfig.client.Close()

	handler := &ConsumerGroupHandler{
		h:     h,
		topic: topic,
		cfg:   *kafkaConfig,
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	wg := &sync.WaitGroup{}
	wg.Add(1)

	go func() {
		defer wg.Done()
		for {
			if err := kafkaConfig.client.Consume(ctx, []string{topic}, handler); err != nil {
				log.Printf("Error from consumer: %v", err)
			}

			if ctx.Err() != nil {
				return
			}
		}
	}()

	// Handle graceful shutdown
	consumptionIsPaused := false
	sigusr1 := make(chan os.Signal, 1)
	signal.Notify(sigusr1, syscall.SIGUSR1)

	sigterm := make(chan os.Signal, 1)
	signal.Notify(sigterm, syscall.SIGINT, syscall.SIGTERM)
	select {
	case <-sigterm:
		fmt.Println("Received termination signal. Initiating shutdown...")
		cancel()
	case <-ctx.Done():
		fmt.Println("terminating: context cancelled")
	case <-sigusr1:
		toggleConsumptionFlow(kafkaConfig.client, &consumptionIsPaused)
	}
	// Wait for the consumer to finish processing
	wg.Wait()
	return nil
}
