//console.log(document.getElementById('map'));
//Model
var data = {
    locations: [//array of objects holding location data
    {
        title: "Dinosaur Tracks",
        lat: 38.533470,
        lng: -109.607889,
        category: 'Hiking Trail'
    }, {
        title: "Eddie McStiff's",
        lat: 38.572465,
        lng: -109.549875,
        category: 'Food/Beverage'
    }, {
        title: "Canyonlands National Park",
        lat: 38.459697,
        lng: -109.820975,
        category: 'Park'
    }, {
        title: "Arches National Park",
        lat: 38.616527,
        lng: -109.619682,
        category: 'Park'
    }, {
        title: "La Sal Mountain Loop",
        lat: 38.494108,
        lng: -109.455186,
        category: 'Scenic Drive'
    }, {
        title: "Moab Brewery",
        lat: 38.562600,
        lng: -109.549709,
        category: 'Food/Beverage'
    }]
};

//ViewModel
var ViewModel = function() {
    this.places = ko.observableArray();
    data.locations.forEach(function(location) {
        this.places.push(location);
    }, this);

    //The code below for filtering the this.places() array was adapted from
    //http://stackoverflow.com/questions/20857594/knockout-filtering-on-observable-array
    this.currentFilter = ko.observable(); //the selected category to use for filtering
    var self = this;
    this.filterPlaces = ko.computed(function() {
        if(!this.currentFilter() || this.currentFilter() === "All") {//TODO: remove !this.currentFilter()?
            return this.places();
        } else {
            return ko.utils.arrayFilter(this.places(), function(place) {
                //console.log(self.currentFilter());
                /*if (place.category === self.currentFilter()) {
                    place.marker.setMap(map);
                } else {
                    place.marker.setMap(null);
                }*/

                return place.category === self.currentFilter();
            });
        }
    }, this);

    //function that hides/shows list when hamburger icon is clicked
    this.toggleList = function() {
        $('#list-container').toggleClass('hidden');
    };

    this.filterMarkers = function() {
        //In a change event handler, this refers to the outer (viewModel) context
        console.log(this.places()[0].marker);
        //if (this.places()[0].marker) {//If markers have been added to place objects
            ko.utils.arrayForEach(this.places(), function(place){
                //If the filter is "All", or if category matches filter and marker is not on map:
                if (self.currentFilter() === "All" || place.category === self.currentFilter()) {
                    if (!place.marker.map) {
                        console.log('setMap');
                        place.marker.setMap(map);//put marker on map
                    }
                } else if (place.marker.map) {
                //If filter is not "All" and it doesn't match category and marker is on map:
                    place.marker.setMap(null);//remove marker from map
                }
            });
        //}
    };

    this.animateMarker = function(data) {
        data.marker.setAnimation(google.maps.Animation.DROP);
        setTimeout(function() {
            data.marker.setAnimation(google.maps.Animation.BOUNCE);
        }, 500);
        setTimeout(function() {
            data.marker.setAnimation(null);
        }, 4000);
    };

    //function that changes styling on list item when it is clicked
    this.clickItem = function(data, event) {
        //In a click handler function, this refers to the object corresponding
        //to the DOM element that was clicked
        //console.log(this);
        $(event.target).addClass('highlighted');//TODO: remove $()?, change addClass to toggleClass?
        $(event.target).siblings('.highlighted').removeClass('highlighted');//TODO: remove $()?
        //console.log(data);
        self.animateMarker(data);
    };
};

var map;
var initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.584435, lng: -109.54984},
        zoom: 11
    });
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    ko.utils.arrayForEach(viewModel.places(), function(place) {
        place.marker = new google.maps.Marker({
            position: {lat: place.lat, lng: place.lng},
            map: map,
            title: place.title
        });
    });
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

console.log(viewModel.places());
