import os

path = '/Library/WebServer/Documents/Karen-2016/emoji/'

def print_emoji_names ():
	for filename in os.listdir(path):
		if filename.endswith('.png'):
			print "'%s'," % filename


def normalize_imgnames (dirname, ext):
	norm_ext = '.jpg'
	for filename in os.listdir(dirname):
		path = os.path.join(dirname, filename)

		root, ext = os.path.splitext(filename)
		if ext != norm_ext:
			norm_path = os.path.join (dirname, filename.replace(ext, norm_ext, 1))
			os.rename(path, norm_path)

if __name__ == '__main__':
	dirname = '/Library/WebServer/Documents/Karen-2016/named-pics/'
	normalize_imgnames(dirname, '.jpg')