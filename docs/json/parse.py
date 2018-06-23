'''
Test
'''
import json
import re

mds = {}

def parse_modules():
   
  with open('docs.json') as file:
    data = json.load(file)
    _modules = [d for d in data['children']]
    # module_names = [d['name'] for d in modules]

    for m in _modules:
      name = re.sub(r'\"', '', m['name'])
      mds[name] = m

    save_temp(json.dumps(mds['Bound']['children'][0], indent=4, sort_keys=True))

    
def save_temp(data):
  f = open('temp.json', 'w')
  f.write(data)
  f.close()


parse_modules()
