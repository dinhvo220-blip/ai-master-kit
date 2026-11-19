import numpy as np
a=np.memmap('/root/bb/masks15.u8',np.uint8,'r').reshape(-1,960,540); n=len(a)
o=np.memmap('/root/bb/masks30.u8',np.uint8,'w+',shape=(2*n,960,540))
for j in range(n):
  o[2*j]=a[j]; o[2*j+1]=((a[j].astype(np.uint16)+a[min(j+1,n-1)])//2).astype(np.uint8)
o.flush(); print('masks30',2*n)
