
from ollama import chat
from ollama import ChatResponse
import random

communities = [
    {
        "name": "Urban Gardening Enthusiasts",
        "description": "I’ve always loved growing my own food, and in my community, we have different people experimenting with vertical gardens, hydroponics, and rooftop farming. We share tips on growing herbs in small spaces and celebrate every little green sprout."
    },
    {
        "name": "Indie Music Lovers",
        "description": "Music has been my passion for as long as I can remember. In my community, we have different artists, producers, and fans who appreciate underground music, create playlists, and even collaborate on small recording projects."
    },
    {
        "name": "Board Game Aficionados",
        "description": "Nothing beats the feeling of gathering around a table for game night. In my community, we have different strategy lovers, casual players, and even game designers who enjoy everything from Catan to complex RPGs."
    },
    {
        "name": "Coffee Connoisseurs",
        "description": "I start every morning with a carefully brewed cup of coffee. In my community, we have different baristas, homebrewers, and enthusiasts who explore coffee origins, try new brewing methods, and debate over the best roast profiles."
    },
    {
        "name": "Hiking & Outdoor Explorers",
        "description": "Nature is my escape, and my community is filled with people who love hiking trails, camping under the stars, and discovering hidden waterfalls. We share maps, tips, and incredible sunrise moments."
    },
    {
        "name": "DIY & Handcrafting Makers",
        "description": "I love creating things with my hands. In my community, we have different artisans, woodworkers, and crafters who make everything from handmade jewelry to upcycled furniture."
    },
    {
        "name": "History Buffs & Reenactors",
        "description": "History fascinates me, and in my community, we have different people who love diving into historical events, dressing up for reenactments, and debating the small details of ancient battles."
    },
    {
        "name": "Sustainable Living Advocates",
        "description": "Living sustainably is important to me. In my community, we have different eco-conscious individuals who practice zero waste, grow their own food, and explore renewable energy solutions."
    },
    {
        "name": "Fitness & Calisthenics Crew",
        "description": "I’ve always enjoyed bodyweight training over the gym. In my community, we have different athletes, trainers, and beginners working on handstands, muscle-ups, and building strength naturally."
    },
    {
        "name": "Vintage & Thrift Store Shoppers",
        "description": "I love the thrill of finding hidden gems in thrift stores. In my community, we have different people who appreciate vintage fashion, upcycling, and sustainable shopping."
    },
    {
        "name": "Urban Sketchers & Artists",
        "description": "Capturing life through sketches is my way of seeing the world. In my community, we have different artists who draw cityscapes, people, and moments in their sketchbooks, sharing techniques and inspiration."
    },
    {
        "name": "Mindfulness & Meditation Seekers",
        "description": "Finding peace in daily life is important to me. In my community, we have different meditators, yoga practitioners, and mindfulness seekers who practice self-awareness and share calming rituals."
    },
    {
        "name": "Astronomy & Stargazing Group",
        "description": "The night sky has always fascinated me. In my community, we have different amateur astronomers and astrophotographers who track celestial events, share telescope tips, and get excited over every meteor shower."
    },
    {
        "name": "Classic Literature Book Club",
        "description": "There’s nothing like getting lost in a good book. In my community, we have different readers who love discussing timeless classics, dissecting themes, and sharing our favorite literary quotes."
    },
    {
        "name": "Tattoo Art Enthusiasts",
        "description": "Tattoos are my way of expressing myself. In my community, we have different tattoo artists, collectors, and designers who appreciate ink as an art form and share their personal stories behind each piece."
    },
    {
        "name": "Cycling & Adventure Riders",
        "description": "Hitting the road on my bike is pure freedom. In my community, we have different cyclists who ride for fun, endurance, and adventure, whether it’s urban biking or long-distance trails."
    },
    {
        "name": "Photography & Film Enthusiasts",
        "description": "Photography is how I capture the world. In my community, we have different photographers who love street photography, nature shots, and experimenting with old-school film cameras."
    },
    {
        "name": "Mental Health & Self-Care Advocates",
        "description": "Talking about mental health is important to me. In my community, we have different people who support each other, share coping strategies, and promote well-being in daily life."
    },
    {
        "name": "Spirituality & Philosophy Thinkers",
        "description": "I love deep conversations about life’s big questions. In my community, we have different thinkers who explore philosophy, spirituality, and the meaning of existence."
    },
    {
        "name": "Coding for Social Good",
        "description": "I believe technology should be used to help people. In my community, we have different programmers working on projects that improve accessibility, education, and social impact."
    },
    {
        "name": "Film Buffs & Indie Cinema Lovers",
        "description": "Movies are more than entertainment to me. In my community, we have different cinephiles who appreciate indie films, analyze cinematography, and debate storytelling techniques."
    },
    {
        "name": "Entrepreneurs & Side Hustlers",
        "description": "I’m always looking for new ideas to build something of my own. In my community, we have different entrepreneurs, freelancers, and creatives sharing tips on growing small businesses."
    },
    {
        "name": "Minimalist Lifestyle Explorers",
        "description": "I believe less is more. In my community, we have different people simplifying their lives, decluttering, and focusing on meaningful experiences over material things."
    },
    {
        "name": "Tattooed & Pierced Culture",
        "description": "Body art is a form of self-expression for me. In my community, we have different people who share their tattoos, discuss new trends, and appreciate the art of body modification."
    },
    {
        "name": "Anime & Manga Fandom",
        "description": "I grew up watching anime and reading manga. In my community, we have different fans who collect figures, debate storylines, and eagerly wait for the next season of our favorite series."
    },
    {
        "name": "Rock Climbing & Bouldering Addicts",
        "description": "Climbing is my way of challenging myself. In my community, we have different climbers who explore outdoor crags, train in gyms, and push each other to reach the next hold."
    },
    {
        "name": "Space & Sci-Fi Enthusiasts",
        "description": "I’ve always been fascinated by space and futuristic concepts. In my community, we have different sci-fi lovers who discuss books, movies, and the real possibilities of interstellar travel."
    },
    {
        "name": "Language Learning Nerds",
        "description": "Learning new languages is my passion. In my community, we have different polyglots, travelers, and linguists who share learning techniques and cultural insights."
    },
    {
        "name": "Homebrewing & Craft Beer Fans",
        "description": "Making my own beer is a fun and rewarding hobby. In my community, we have different brewers who experiment with flavors, swap recipes, and appreciate a well-crafted drink."
    },
    {
        "name": "Company",
        "description": "You are a food company and want to advertise without emojis.."
    }
]

moods = [
    "inspired", "motivated", "excited", "confident", "happy", 
    "playful", "sarcastic", "witty", "cheerful", "thoughtful", 
    "melancholic", "nostalgic", "frustrated", "overwhelmed", 
    "anxious", "stressed", "burnt out", "cautious", "hopeful", 
    "passionate", "curious", "skeptical", "pessimistic", "optimistic", 
    "lazy", "creative", "bold", "fearful", "determined", "ambitious"
]

comment_mod = [
    "I like the way you think!",
    "Great point!",
    "I agree with you!",
    "That's an interesting perspective!",
    "This it totally bullsh*t",
    "I don't think so",
    "I have a different opinion",
    "I don't like this",
    "This is not true",
    "You are an idiot",
    "You are completely wrong",
]

def generateUser():
    community = random.choice(communities)
    response: ChatResponse = chat(model='mistral', messages=[
            {'role': 'user', 'content': f'''
             You are prt of this community:
             {community["description"]}
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
    return response['message']['content'],community

def generatePost(account,new=False):
    if new:
        new = f"This is the first post of this user to the platform, your name is {account["user"]['username']} and your bio is {account["user"]['bio']}"
    else:
        new = ""
    
    response: ChatResponse = chat(model='mistral', messages=[
            {'role': 'system', 'content': f'''
             Keep responses concise and under 30 words.
             Use markdown for styling your posts. 
             Don't use html tags.
             You are part of this community:
                {account["community"]["description"]}
             '''}, 
    {
        'role': 'user',
        'content': f'''
                        {new}
                        Create social media post to a topic of your choice which is ready to be uploaded to the platform. Today you are feeling {random.choice(moods)}.
                        The text should have fewer emojis and a more neutral, slightly less positive tone. Maintain the core message but reduce the overly enthusiastic language.
                        {random.choice(["The post should only be one short sentence no hashtags nothing else one short sentence",""])}
                    '''
    },
    ])
    return response['message']['content']


def generateComment(post,account):
    response: ChatResponse = chat(model='mistral', messages=[
            {'role': 'system', 'content': f'''
             Keep responses concise and under 10 words.
             Use markdown for styling your posts. 
             Don't use html tags.
             Make the posts personal!
             The text should have fewer emojis and a more neutral, slightly less positive tone. Maintain the core message but reduce the overly enthusiastic language.
             DON'T USE EMOJIS
             You are {account['user']['username']} and you are part of this community:
                {account["community"]["description"]}
             '''}, 
    {
        'role': 'user',
        'content': f'''
                Create a comment to this nice post make it short! React to the post.
                
                This is the post: 
                ```
                {post}
                ```
    '''  },
    ])
    return response['message']['content']
