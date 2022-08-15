# twitter-cve2db
System composed of a mongodb replica set and a worker that keeps the db up to date with the CVE feed.

Architecture
![cve2db-architecture](https://user-images.githubusercontent.com/8590004/184642927-dc604479-7131-45ac-a12a-287cc6b94aa8.jpg)

Prerequisite:
- linux server
- docker
- docker-compose
- twitter user account
- bearer token (obtained from https://developer.twitter.com/)

Usage:

To deploy run the start.sh script:

```
./start.sh
```

Configuration:

For tweaking the system you can use a `.env` file in the root directory of this project

The only required env variables are:
- BEARER_TOKEN - the twitter bearer token
- MONGODB - mongodb connection string

.env file example (or can also be set directly in docker-compose.yml in the environment section)
```
###
#Get bearer token from the twitter account *required*
BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAHn6fgEAAAAAOrFAH3IbzjJNAZkjsdlfkjslkfjslkdfjslkdfjsldkfjlsdjflksdjflksdjflksdjf
###
#Twitter username to extract tweets from | default CVENew
TWITTER_USERNAME=CVENew
###
#How many tweets to get per request ( must be between 5 and 100 ) | default: 10
TWEETS_REQ=10
##Max number of tweets to get per requset ( must be between 5 and 100 ) | default: 100
TWEETS_REQ_LIMIT=100
###
#How often to check for new tweets; in minutes | default: 30
INTERVAL=30
###
#MongoDB URI
#MONGODB=mongodb://localhost:27017/cve
MONGODB='mongodb://user:password@mongo1:27017,mongo2:27017,mongo3:27017/cve?authSource=admin&replicaSet=dbrs&retryWrites=true&w=majority'
```