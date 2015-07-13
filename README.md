# node-poll

A weekend Node.js project imitating [strawpoll.me](http://strawpoll.me).

App is hosted on Heroku: [node-poll.herokuapp.com](http://node-poll.herokuapp.com)

## API

#### GET /api/polls
Get list of polls.

#### GET /api/poll/:id
Get a single poll.

####POST /api/poll
Create a poll.
```json
{
    "name": "Best drink?",
    "options": [
        "Coke",
        "Gatorade",
        "Ginger Ale"
        ],
    "track_ip": true
}
```

#### PUT /api/poll/:id/vote
Vote on a poll.
```json
{
    "option_id": 29
}
```