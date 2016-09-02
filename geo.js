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
        category: 'Hiking Trail'
    }, {
        title: "Canyonlands National Park",
        lat: null,
        lng: null,
        category: 'Park'
    }]
}

//ViewModel
var ViewModel = function() {
    this.markers = ko.observableArray();
    data.locations.forEach(function(location) {
        this.markers.push(location);
    }, this);

    this.toggleList = function() {
        $('#list-container').toggleClass('hidden');
    };

    this.clickItem = function(data, event) {
        console.log(data);
        $(event.target).addClass('highlighted');
        $(event.target).siblings().removeClass('highlighted');
        //console.log(event.target);
        //TODO: Add code to highlight map marker
    }
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

console.log(viewModel.markers());
