# twitter-cve2db
System composed of a mongodb replica set and a worker that keeps the db up to date with the CVE feed.

To deploy run the start.sh script

BEARER_TOKEN env variable is required for the worker to function

.env file example (or can also be set directly in docker-compose.yml in the environment section)
###
#*required*
#Get bearer token from the twitter account 
BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAHn6fgEAAAasfsasafsafsdfsafsafsadfsafasfdsafsadfasfsadfsdfsasafsdfsafsa
###
#Twitter username to extract tweets from | default CVENew
TWITTER_USERNAME=CVENew
###
#Max tweets to get per request ( must be between 5 and 100 ) | default: 100
TWEETS_REQ_LIMIT=10
###
#How often to check for new tweets; in minutes | default: 30
INTERVAL=.5
###
#MongoDB URI
#MONGODB=mongodb://localhost:27017/cve
MONGODB='mongodb://mongo1:27017,mongo2:27017,mongo3:27017/cve?replicaSet=dbrs&retryWrites=true&w=majority'
