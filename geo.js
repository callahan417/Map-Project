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
    this.currentFilter = ko.observable(); //property to store the filter
    var self = this;
    this.filterPlaces = ko.computed(function() {
        if(!this.currentFilter() || this.currentFilter() === "All") {//TODO: remove !this.currentFilter()?
            //if commented out code doesn't work, try onchange event binding (select element) for markers
            if (this.places()[0].marker) {
                ko.utils.arrayForEach(this.places(), function(place){
                    if (/*place.marker &&*/ !place.marker.map) {
                        place.marker.setMap(map);
                    }
                });
            }
            return this.places();
        } else {
            return ko.utils.arrayFilter(this.places(), function(place) {
                //console.log(self.currentFilter());
                if (place.category === self.currentFilter()) {
                    place.marker.setMap(map);
                } else {
                    place.marker.setMap(null);
                }

                return place.category === self.currentFilter();
            });
        }
    }, this);

    //function that hides/shows list when hamburger icon is clicked
    this.toggleList = function() {
        $('#list-container').toggleClass('hidden');
    };

    //function that changes styling on list item when it is clicked
    this.clickItem = function(data, event) {
        //console.log(data);
        $(event.target).addClass('highlighted');
        $(event.target).siblings().removeClass('highlighted');
        //console.log(event.target);
        //TODO: Add code to highlight/animate map marker
    }
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
