require('dotenv').config()
const {TwitterApi} = require('twitter-api-v2');
const mongoose = require('mongoose');

const bearer = process.env.BEARER_TOKEN
const mongodb = process.env.MONGODB || 'mongodb://mongo1:27017,mongo2:27017,mongo3:27017/cve?replicaSet=dbrs&retryWrites=true&w=majority'
const twitterUsername = process.env.TWITTER_USERNAME || 'CVENew'
const maxTwittsPerRequest = process.env.TWEETS_REQ_LIMIT || 10
const timeoutInterval = process.env.INTERVAL || 30

const twitterClient = new TwitterApi(bearer);
const roClient = twitterClient.readOnly;

const cveSchema = new mongoose.Schema({
    tweet_id: String,
    created_at: Date,
    text: String,
    entities: Array
  });
const CVE = mongoose.model('CVE', cveSchema);

console.log("Waiting for database...")
setTimeout(function () {
    console.log('Started!')
    startWorker().catch(err => console.log(`Error: the worker has crashed: ${err}`))
}, 30000)

async function startWorker(){
    mongoose.connect(mongodb).catch(err => console.log(`Could not connect to DB: ${err}`))

    saveTweetsToDB().catch(err => console.log(`Could not save data to DB: ${err}`))

    setTimeout(function () {
        startWorker()
    }, timeoutInterval * 60 * 1000)
}

async function saveTweetsToDB(){
    const userID = await fetchUserID()
    const tweets = await fetchTweets( userID )
    tweets.forEach(async tweet => {
        const exists = await checkIfTweetExistsInDB(tweet?.id)
        if(!exists) saveTweet(tweet)
    });
}

async function fetchUserID(){
    try{
        const user = await roClient.v2.userByUsername(twitterUsername);
        return user?.data?.id
    }catch (err) {
        throw `Could not fetch user ID: ${err}`
    }
}

async function checkIfTweetExistsInDB (tweetId){
    try{
        const exists = await CVE.exists({tweet_id: tweetId})
        return Boolean(exists)
    }catch (err) {
        throw `Could not check if ${tweetId} exists: ${err}`
    }
}

async function fetchTweets(userID, options={ "max_results": 5, "exclude": "replies", "tweet.fields": ['id','created_at','text','entities']}){
    try{
        const timeline = await roClient.v2.userTimeline(userID, options)
        const oldestTweetId =  timeline?.meta?.oldest_id
        const oldestExists = await checkIfTweetExistsInDB(oldestTweetId)
        if(options.max_results != maxTwittsPerRequest){
            if(oldestExists){
                return timeline?.data?.data
            }else{
                return await fetchTweets(userID, options={ 
                                                    "max_results": maxTwittsPerRequest,
                                                    "exclude": "replies",
                                                    "tweet.fields": ['id','created_at','text','entities']
                                                })
            }
        }else{
            return timeline?.data?.data
        }
    }catch (err) {
        throw `Could not fetch tweets: ${err}`
    }

}

async function saveTweet(tweet){
    const cveEntry = new CVE({ tweet_id: tweet?.id,
        created_at: tweet?.created_at,
        text: tweet?.text,
        entities: tweet?.entities
    })

    cveEntry.save(err => {
        if (err) throw `Cound not handle the write opperation: ${err}`
        // Tweet saved!
    })
}
