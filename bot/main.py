# About:
# This script generates bots which interact with the platform

import requests
import base64
import json
import time
import random
import pprint

from prompts import generateUser, generatePost,generateComment

URL = "http://localhost:4000/graphql"

def make_request(mutation, token=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    payload = {"query": mutation}
    response = requests.post(URL, json=payload, headers=headers)
    
    if response.status_code == 200:
        return response.json().get("data", {})
    else:
        print(f"Request failed with status code {response.status_code}")
        print(response.text)
        return None

def login(username, password):
    mutation = f'''
    mutation Login {{
        login(username: "{username}", password: "{password}") {{
            token
            error
        }}
    }}
    '''
    data = make_request(mutation)
    
    if data:
        login_response = data.get("login", {})
        token = login_response.get("token")
        error = login_response.get("error")
        
        if token:
            print("Login successful!")
            return token
        elif error:
            print(f"Login failed! Error: {error}")
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
            password: "{password}",
            isPrivate: false
        ) {{
            token
            error
        }}
    }}
    '''
    data = make_request(mutation)
    
    if data:
        create_user_response = data.get("createUser", {})
        token = create_user_response.get("token")
        error = create_user_response.get("error")
        
        if token:
            return token
        elif error:
            print(f"User creation failed! Error: {error}")
    return None

def create_post(content, token, referred_to=None):
    encoded_content = base64.b64encode(content.encode()).decode()
    mutation = f'''
    mutation CreatePost {{
        createPost(content: "{encoded_content}"{f", referredTo: \"{referred_to}\"" if referred_to else ""}, isActivated: true) {{
            postId
            error
        }}
    }}
    '''
    data = make_request(mutation, token)
    
    if data:
        post_response = data.get("createPost", {})
        error = post_response.get("error")
        post_id = post_response.get("postId")
        
        if error:
            print(f"Post creation failed! Error: {error}")
            return None
        return post_id if post_id else True
    return None

def send_follower_request(token, username):
    mutation = f'''
    mutation {{
        requestFollow(username: "{username}") {{
            success
            error
        }}
    }}
    '''
    data = make_request(mutation, token)
    
    if data:
        response = data.get("requestFollow", {})
        error = response.get("error")
        
        if error:
            print(f"Sending follower request failed! Error: {error}")
            return None
        return True
    return None

def likePost(post,token):
    mutation = f'''
    mutation {{
        likePost(postId: "{post["postId"]}", remove: false) {{
            error
        }}
    }}
    '''
    data = make_request(mutation, token)
    
    if data:
        error = data.get("likePost", {}).get("error")
        if error:
            print(f"Post like failed! Error: {error}")
            return None
        return True
    return None

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

class User:
    def __init__(self):
        self.error = False
        try:
            user,self.community = generateUser()
            self.user = json.loads(user)
            self.token = create_user(
                        username=self.user["username"],
                        first_name=self.user["first_name"],
                        last_name=self.user["last_name"],
                        bio=self.user["bio"],
                        date_of_birth=self.user["date_of_birth"],
                        email=self.user["email"],
                        password=self.user["password"]
                    )
            if not self.token:
                self.error = True
                return
            self.account = {"user":self.user,"token":self.token,"community":self.community}
            self.new = True
        except Exception as error:
            self.error = True
            return
        return
    def __str__(self):
        return f"Username: {self.user['username']} Token: {self.token}"
    def generateInit(self):
        account = {"user":self.user,"token":self.token,"community":self.community}
        post = generatePost(account, new=1)
        create_post(post,self.token)
        return post
    def createPost(self):
        if self.new:
            post = self.generateInit()
            self.new = False
            return post
        post = generatePost(self.account)
        create_post(post,self.token)
        return post
    def createComment(self,post):
        comment = generateComment(post,self.account)
        create_post(comment,self.token, referred_to=post["postId"])
        return
    def likePost(self,post):
        likePost(post,self.token)
        return
    def sendFollowerRequest(self,username):
        send_follower_request(self.token,username)
        return
    def getPosts(self):
        posts = get_newest_posts(self.token)
        post = random.choice(posts)
        return post
    def getFriends(self):
        users = get_users()
        user = random.choice(users)
        return user["username"]
    def doRandomAction(self):
        acceptFollowers(self.token)
        actions = ["createPost", "createComment", "likePost", "sendFollowerRequest"]
        probabilities = [0.1, 0.2, 0.5, 0.2]
        
        action = random.choices(actions, weights=probabilities, k=1)[0]
        pprint.pprint(f"Action: {action}")
        if action == "createPost":
            self.createPost()
        elif action == "createComment":
            post = self.getPosts()
            self.createComment(post)
        elif action == "likePost":
            post = self.getPosts()
            self.likePost(post)
        elif action == "sendFollowerRequest":
            user = self.getFriends()
            self.sendFollowerRequest(user)
        return
    
def generateRobotNet(amount=1,timing=1):
    accounts = []
    user = User()
    if user.error:
        print("User generation failed")
        return
    accounts.append(user)
    while True:
        actions = [True, False]
        probabilities = [0.05, 0.95]
        action = random.choices(actions, weights=probabilities, k=1)[0]
        if action:
            user = User()
            pprint.pprint(user)
            if user.error:
                print("User generation failed")
                return
            accounts.append(user)
        else:
            user = random.choice(accounts)
            user.doRandomAction()
            time.sleep(timing)

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

def get_newest_posts(token):
    query = '''
    query GetNewestPosts {
        getNewestPosts {
            error
            posts {
                postId
                content
            }
        }
    }
    '''
    data = make_request(query,token=token)
    
    if data:
        response = data.get("getNewestPosts", {})
        error = response.get("error")
        posts = response.get("posts", [])
        
        if error:
            print(f"Fetching posts failed! Error: {error}")
            return None
        return posts
    return None

if __name__ == '__main__':
    generateRobotNet(1)
    