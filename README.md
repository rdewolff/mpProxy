# MuseumPlus Proxy

This version is built using Derby.js

## TODO

- Synchronizer : init sync
  - get all the available modules
  - get the structure (field, maybe some data to help to work on the mapping?)
- Synchronizer : keep various sync under collection ID to be able to rollback (would be a nice-to-have feature)
- Synchronizer : cancel button to stop process
- Move the server config file higher in the directory structure

## Derby questions

TODO: merge with questions wrote in draft email.

1. working with collection without IDs. When trying to access some data structure like a.b.c, we get the following error :

  ```Error: set must be performed under a collection and document id. Invalid path: user. Is that a normal behavior? I'd love to get more explaination about this.```

  same happens when trying to to scope a ```a.b.c.d``` but with a different error message :

  ```Trace: Document already exists```

2. .

# Derby notes & remarks

1. Working with model without collection ID needs to be done under a particular level.


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



## Bootstrap references

- buttons : [http://bootsnipp.com/buttons]
