import os
import glob

files = glob.glob("/home/vboxuser/Desktop/finance_app/frontend/src/pages/*.tsx")

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    modified = False
    if "api.get('/accounts')" in content:
        content = content.replace("api.get('/accounts')", "api.get('/accounts/')")
        modified = True
    if "api.post('/accounts'" in content:
        content = content.replace("api.post('/accounts'", "api.post('/accounts/'")
        modified = True
        
    if modified:
        with open(file, 'w') as f:
            f.write(content)
        print(f"Fixed {file}")
