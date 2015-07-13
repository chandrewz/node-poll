# node-poll

A weekend Node.js project imitating [strawpoll.me](http://strawpoll.me).

App is hosted on Heroku: [node-poll.herokuapp.com](http://poll-node.herokuapp.com)

## API

#### GET /api/polls

#### GET /api/poll/:id

####POST /api/poll
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
```json
{
    "option_id": 29
}
```