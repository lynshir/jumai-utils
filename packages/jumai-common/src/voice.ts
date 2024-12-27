import type { BaseData } from './request';
import { request } from './request';

const voiceCache = new Map<string, string>();

/**
 * 播放声音
 * @param url
 */
export function playVoice(url: string): void {
  const audio = new Audio();
  audio.src = url;
  audio.autoplay = true;
}

/**
 * @param tex 语音文本
 * @param per 声音类型
 */
export function getAndPlayVoice(tex: string, per = '0'): void {
  if (!tex) {
    return;
  }

  const key = `${per}_${tex}`;
  const value = voiceCache.get(key);
  if (value) {
    playVoice(value);
  } else {
    request<BaseData<string>>({
      url: '/api/wms/rest/voice/getVoiceUrlByCache',
      method: 'POST',
      data: {
        tex,
        per,
      },
    })
      .then((res) => {
        if (res.data) {
          voiceCache.set(key, `data:audio/mpeg;base64,${res.data}`);
          playVoice(voiceCache.get(key));
        }
      });
  }
}
