"""
note: run within django ENV (~/devel/django/ENV)
"""

import os, sys
from PIL import Image

def convert (src, dst_dir):
	src_dir, filename = os.path.split(src)
	root, ext = os.path.splitext(filename)
	if ext != '.png':
		# raise Exception, 'PNG required (%s)' % filename
		print 'WARN: PNG required (%s)' % filename
		return
	
	im = Image.open(src)
	bg = Image.new("RGB", im.size, (255,255,255))
	bg.paste(im,im)
	
	dst = os.path.join (dst_dir, root+'.jpg')
	bg.save(dst)
	print 'wrote jpg to %s' % dst

def convert_dir (src_dir, dst_dir):
	for filename in os.listdir(src_dir):
		src = os.path.join(src_dir, filename)
		convert (src, dst_dir)

if __name__ == '__main__':

	src_dir = '/Library/WebServer/Documents/Karen-2016/emoji-png/'
	dst_dir = '/Library/WebServer/Documents/Karen-2016/emoji-jpg/'
	filename = 'ant.png'
	src = os.path.join (src_dir, filename)
	# convert (src, dst_dir)
	convert_dir (src_dir, dst_dir)


