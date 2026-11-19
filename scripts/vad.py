import json
from faster_whisper.audio import decode_audio
from faster_whisper.vad import get_speech_timestamps, VadOptions
out={}
for i in range(1,7):
  a=decode_audio(f'/root/bb/a{i}.wav',sampling_rate=16000)
  ts=get_speech_timestamps(a,VadOptions(threshold=0.5,min_silence_duration_ms=280,speech_pad_ms=60))
  out[i]=[(t['start']/16000,t['end']/16000) for t in ts]
  print(i,[(round(s,2),round(e,2)) for s,e in out[i]])
json.dump(out,open('/root/bb/vad.json','w'))
