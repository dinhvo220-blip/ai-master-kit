from faster_whisper import WhisperModel
import json
m=WhisperModel('medium',device='cpu',compute_type='int8',cpu_threads=1)
segs,_=m.transcribe('a0.wav',language='vi',beam_size=3,vad_filter=True,word_timestamps=True,initial_prompt='Chloé, Gaby Aghion, Paris.',condition_on_previous_text=False)
out=[]
for s in segs:
    out.append({'s':s.start,'e':s.end,'t':s.text,'w':[{'w':w.word,'s':w.start,'e':w.end,'p':w.probability} for w in s.words]})
    print(round(s.start,2),round(s.end,2),s.text,flush=True)
json.dump(out,open('full.json','w'),ensure_ascii=False)
print('DONE')
