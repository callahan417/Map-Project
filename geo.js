//console.log(document.getElementById('map'));
//Model
var data = {
    locations: [//array of objects holding location data
    {
        title: "Dinosaur Tracks",
        lat: null,
        lng: null,
        category: 'Hiking Trail'
    }, {
        title: "Eddie McStiff's",
        lat: null,
        lng: null,
        category: 'Food/Beverage'
    }, {
        title: "Canyonlands National Park",
        lat: null,
        lng: null,
        category: 'Park'
    }]
}

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
        if(!this.currentFilter() || this.currentFilter() === "All") {
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

    //function that changes styling on list item when it is clicked
    this.clickItem = function(data, event) {
        //console.log(data);
        $(event.target).addClass('highlighted');
        $(event.target).siblings().removeClass('highlighted');
        //console.log(event.target);
        //TODO: Add code to highlight/animate map marker
    }
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

console.log(viewModel.places());
