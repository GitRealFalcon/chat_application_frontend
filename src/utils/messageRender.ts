export const URL_REGEX = /(https?:\/\/[^\s]+)/g

export const extractUrls = (text: string): string[] => {
  return text.match(URL_REGEX) ?? []
}

export const stripUrls = (text: string): string => {
  return text.replace(URL_REGEX, ' ').replace(/\s+/g, ' ').trim()
}

export const isImageUrl = (url: string): boolean => {
  return /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)
}

export const isVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url)
}

export const classifyMessageUrls = (
  text: string,
  messageType?: 'text' | 'image' | 'video' | 'document'
) => {
  const urls = extractUrls(text)
  const plainText = stripUrls(text)

  if (messageType === 'image') {
    return {
      urls,
      plainText,
      imageUrls: urls,
      videoUrls: [],
      fileUrls: [],
    }
  }

  if (messageType === 'video') {
    return {
      urls,
      plainText,
      imageUrls: [],
      videoUrls: urls,
      fileUrls: [],
    }
  }

  if (messageType === 'document') {
    return {
      urls,
      plainText,
      imageUrls: [],
      videoUrls: [],
      fileUrls: urls,
    }
  }

  const imageUrls =
    urls.filter(isImageUrl)

  const videoUrls =
    urls.filter(isVideoUrl)

  const fileUrls =
    urls.filter((url) => !isImageUrl(url) && !isVideoUrl(url))

  return {
    urls,
    plainText,
    imageUrls,
    videoUrls,
    fileUrls,
  }
}
