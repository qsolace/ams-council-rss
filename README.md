# AMS Council RSS Feed
An RSS feed generator for the Agenda of UBC's Alma Mater Society council meetings.

Currently, when the user runs `yarn start`, an RSS feed of all meetings found on https://www.ams.ubc.ca/about-us/student-council/agendas-presentations-minutes/ 
is generated at the project root. 

## TODO
- [ ] Set up a server that responds to a GET request with the RSS feed
- [ ] Do some feed caching so we don't have to bother the AMS website a whole bunch of times
- [ ] Actually figure out hosting this puppy
