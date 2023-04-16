#!/bin/bash
curl -i -X GET http://localhost:4000/
echo -e "\nadding bot\n"
curl -i -X PUT -H 'Content-Type: application/json' -d '{"name":"Rahul Ghosh"}' http://localhost:4000/bots/07032002/create
echo -e "\nfetching bot\n"
curl -i -X GET http://localhost:4000/bots
echo -e "\nfetching specific bot\n"
curl -i -X GET http://localhost:4000/bots/07032002
echo -e "\nadding actions\n"
curl -i -X POST -H 'Content-Type: application/json' -d '{"action":{"type": "connect","data": {}}}' http://localhost:4000/bots/07032002/actions/add
curl -i -X POST -H 'Content-Type: application/json' -d '{"action":{"type": "enterRoom", "data": {"domain":"app.ethereal-engine.com","locationName":"default"}}}' http://localhost:4000/bots/07032002/actions/add
echo -e "\nrunning actions\n"
curl -i -X POST  http://localhost:4000/bots/run
echo -e "\ndeleting bot\n"
curl -i -X DELETE http://localhost:4000/bots/07032002/delete
curl -i -X DELETE http://localhost:4000/bots/clear
echo -e "\nfetching bot again\n"
curl -i -X GET http://localhost:4000/bots

