type StreamType = string
type StreamName<T extends StreamType = StreamType> = `${T}:${string}`


function fromStreamName<T extends StreamType>(streamName: StreamName<T>): StreamNameParts<T> {
  const parts = streamName.split(':') as [T, string]
  return {
    streamType: parts[0],
    streamId: parts[1],
  }
}

const { streamId, streamType } = fromStreamName('type:123')

type StreamNameParts<T extends StreamType = StreamType> = {
  streamType: T
  streamId: string
}

type CollectionResolution = {
  databaseName?: string
  collectionName: string
}
