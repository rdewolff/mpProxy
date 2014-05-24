# MuseumPlus Proxy

This version is built using Derby.js

## TODO

- Move the server config file higher in the directory structure


## Known issues

## Documentation

### Synchronization mechanism

The client decide the run the synchronizer. The model information are stored in the ```sync``` collection.

#### Use case

1. The client pusht the "Run synchronizer" button
2. The ```sync.start``` is set to the current time (using ```Date()```)
3. The ```sync.inProgress``` is set to true
4. The synchronization is running on the server side. All logs are added to ```sync.log```. These are display in the admin zone for following up.
5. When the sychronization ends, the ```sync.inProgress``` is set to false.

TBD Cancel button.


## Bootstrap references

- buttons : [http://bootsnipp.com/buttons]
