# About:
# This script generates bots which interact with the platform

from ollama import chat
from ollama import ChatResponse
import requests
import base64
import json
import time
import random

URL = "http://localhost:4000/graphql"

def login(username, password):
    mutation = f'''
    mutation Login {{
        login(username: "{username}",password: "{password}") {{
            token
            error
        }}
    }}
    '''
    payload = {"query": mutation}

    response = requests.post(URL, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        login_response = data.get("data", {}).get("login", {})
        token = login_response.get("token")
        error = login_response.get("error")
        
        if token:
            print(f"Login successful! Token")
            return token
        elif error:
            print(f"Login failed! Error: {error}")
            return None
    else:
        print(f"Request failed with status code {response.status_code}")
        print(response.text)
        return None

def create_user(username, first_name, last_name, bio, date_of_birth, email, password):
    mutation = f'''
    mutation {{
        createUser(
            username: "{username}",
            firstName: "{first_name}",
            lastName: "{last_name}",
            bio: "{bio}",
            dateOfBirth: "{date_of_birth}",
            email: "{email}",
            password: "{password}"
            isPrivate: false
        ) {{
            token
            error
        }}
    }}
    '''
    
    payload = {"query": mutation}
    
    response = requests.post(URL, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        create_user_response = data.get("data", {}).get("createUser", {})
        token = create_user_response.get("token")
        error = create_user_response.get("error")
        
        if token:
            print(f"User created successfully! Username: {username}")
            return token
        elif error:
            print(f"User creation failed! Error: {error}")
            return None
    else:
        print(f"Request failed with status code {response.status_code}")
        print(response.text)
        return None

def createPost(content, token):
    content = base64.b64encode(content.encode()).decode()
    mutation = f'''
    mutation Report {{
        createPost(content: "{content}", isActivated: true) {{
            error
        }}
    }}
    '''
    payload = {"query": mutation}

    response = requests.post(URL, json=payload, headers=
                             {"Authorization": f"Bearer {token}"}
)
    
    if response.status_code == 200:
        data = response.json()
        login_response = data.get("data", {}).get("login", {})
        error = login_response.get("error")
        
        if error:
            print(f"Creation of post failed! Error: {error}")
            return None
        else:
            print(f"Post created successfully!")
            return True
        
    else:
        print(f"Creation of post failed with status code {response.status_code}")
        print(response.text)
        return None

def generatePost(additional_prompt=""):
    response: ChatResponse = chat(model='mistral', messages=[
            {'role': 'system', 'content': '''
             Keep responses concise and under 30 words.
             Use markdown for styling your posts. 
             Don't use html tags.
             Make the posts personal!
             '''}, 
    {
        'role': 'user',
        'content': f'''
                Create social media post to a topic of your choice which is ready to be uploaded to the platform.
    {additional_prompt}
    '''  },
    ])
    return response['message']['content']

def generateUser():
    response: ChatResponse = chat(model='mistral', messages=[
            {'role': 'user', 'content': '''
             Output a user object with the following fields, be creative with the values and make usernames unique and random from communities use us names:
                - username
                - first_name
                - last_name
                - bio
                - date_of_birth
                - email
                - password
             Only output the json object dont use comments
             '''}    ])
    return response['message']['content']

def sendFollowerRequest(token, username):
    mutation = f'''
    mutation {{
        requestFollow(username: "{username}") {{
            success
            error
        }}
    }}
    '''
    payload = {"query": mutation}

    response = requests.post(URL, json=payload, headers=
                             {"Authorization": f"Bearer {token}"}
)
    
    if response.status_code == 200:
        data = response.json()
        login_response = data.get("data", {}).get("sendFollowerRequest", {})
        error = login_response.get("error")
        
        if error:
            print(f"Sending follower request failed! Error: {error}")
            return None
        else:
            print(f"Follower request sent successfully!")
            return True
        
    else:
        print(f"Sending follower request failed with status code {response.status_code}")
        print(response.text)
        return None

def generateRobotNet(amount=1,timing=1):
    accounts = []
    for i in range(amount):
        try:
            user = generateUser()
            user = json.loads(user)
            token = create_user(
                username=user["username"],
                first_name=user["first_name"],
                last_name=user["last_name"],
                bio=user["bio"],
                date_of_birth=user["date_of_birth"],
                email=user["email"],
                password=user["password"]
            )
            accounts.append({"user": user, "token": token})
            post = generatePost(f"This is the first post of this user to the platform, your name is {user['username']} and your bio is {user['bio']}")
            time.sleep(timing)
            createPost(post,token)
        except Exception as error:
            print(error)
            print("User generation failed")
    for account in accounts:
        users = get_users()
        for user in users:
            sendFollowerRequest(accounts[0]["token"],user["username"])
            time.sleep(timing)
        acceptFollowers(account["token"])
    while True:
        for account in accounts:
            user = account["user"]
            post = generatePost(f"your name is {user['username']} and your bio is {user['bio']}, create a post to your followers")
            time.sleep(timing)
            createPost(post,token)
            acceptFollowers(account["token"])

def get_users():
    query = '''
    query {
        getUsers {
            username
        }
    }
    '''
    
    payload = {"query": query}
    
    response = requests.post(URL, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        get_users_response = data.get("data", {}).get("getUsers", [])
        
        if get_users_response:
                
            return get_users_response
        else:
            print("No users found!")
            return None
    else:
        print(f"Request failed with status code {response.status_code}")
        print(response.text)
        return None

def acceptFollowerRequest(token, username):
    mutation = f'''
    mutation {{
        acceptFollow(username: "{username}") {{
            success
            error
        }}
    }}
    '''
    payload = {"query": mutation}

    response = requests.post(URL, json=payload, headers=
                             {"Authorization": f"Bearer {token}"}
)
    
    if response.status_code == 200:
        data = response.json()
        login_response = data.get("data", {}).get("acceptFollowRequest", {})
        error = login_response.get("error")
        
        if error:
            print(f"Accepting follower request failed! Error: {error}")
            return None
        else:
            print(f"Follower request accepted successfully!")
            return True
        
    else:
        print(f"Accepting follower request failed with status code {response.status_code}")
        print(response.text)
        return None

def acceptFollowers(token):
    mutation = '''
        query GetFollowRequests {
            getFollowRequests {
                username
            }
        }
    '''
    payload = {"query": mutation}

    response = requests.post(URL, json=payload, headers=
                             {"Authorization": f"Bearer {token}"}
    )

    if response.status_code == 200:
        data = response.json()
        login_response = data.get("data", {}).get("login", {})
        error = login_response.get("error")
        
        if error:
            print(f"Getting followers failed! Error: {error}")
            
        else:
            for user in json.loads(response.text)["data"]["getFollowRequests"]:
                acceptFollowerRequest(token,user["username"])
            return True
        
    else:
        print(f"Creation of post failed with status code {response.status_code}")
        print(response.text)
        return None


if __name__ == '__main__':
    generateRobotNet(1)
    