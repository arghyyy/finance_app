import os
import glob

files = glob.glob("/home/vboxuser/Desktop/finance_app/frontend/src/pages/*.tsx")

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if "localStorage.getItem('token')" in content:
        content = content.replace("localStorage.getItem('token')", "localStorage.getItem('access_token')")
        with open(file, 'w') as f:
            f.write(content)
        print(f"Fixed {file}")
