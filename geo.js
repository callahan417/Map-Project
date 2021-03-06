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
        title: "La Sal Mountains",
        lat: 38.494108,
        lng: -109.455186,
        category: 'Scenic Drive'
    }, {
        title: "Moab Brewery",
        lat: 38.562600,
        lng: -109.549709,
        category: 'Food/Beverage'
    }, {
        title: "Corona Arch",
        lat: 38.574680,
        lng: -109.632429,
        category: 'Hiking Trail'
    }, {
        title: "Utah State Route 128",
        lat: 38.601864,
        lng: -109.575358,
        category: 'Scenic Drive'
    }],
};

//ViewModel
var ViewModel = function() {
    this.places = ko.observableArray();
    data.locations.forEach(function(location) {
        this.places.push(location);
    }, this);
    this.hideList = ko.observable(true);
    this.selected = ko.observable();//the title of the selected marker/list item

    //The code below filters the this.places() array by category (adapted from
    //http://stackoverflow.com/questions/20857594/knockout-filtering-on-observable-array)
    this.currentFilter = ko.observable(); //the category to use for filtering
    var self = this;
    this.filterPlaces = ko.computed(function() {
        if(!this.currentFilter() || this.currentFilter() === "All") {
            return this.places();
        } else {
            return ko.utils.arrayFilter(this.places(), function(place) {
                return place.category === self.currentFilter();
            });
        }
    }, this);

    //function that hides/shows list when hamburger icon is clicked
    this.toggleList = function() {
        this.hideList(!this.hideList());
    };

    //function that shows/hides markers based on the selected category
    this.filterMarkers = function() {
        ko.utils.arrayForEach(this.places(), function(place){
        //If the filter is "All", or if place.category matches filter and marker is not on map:
            if (self.currentFilter() === "All" || place.category === self.currentFilter()) {
                if (!place.marker.map) {
                    place.marker.setMap(map);//put marker on map
                }
            } else if (place.marker.map) {
            //If filter is not "All" and it doesn't match place.category and marker is on map:
                place.marker.setMap(null);//remove marker from map
            }
        });
    };

    //function that drops and bounces marker
    this.animateMarker = function(marker) {
        marker.setAnimation(google.maps.Animation.DROP);
        setTimeout(function() {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }, 500);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 4000);
    };

    //function that requests Wikipedia API information and adds it to info window
    this.fillInfoWindow = function(marker) {
        //Change the infoWindow (content and position) if the clicked marker/item has changed
        if (infoWindow.marker != marker) {
            infoWindow.marker = marker;

            infoWindow.setContent("Requesting Wikipedia API...");
            infoWindow.open(map, infoWindow.marker);

            var wikiRequestTimeout = setTimeout(function() {
                infoWindow.setContent('Error: The Wikipedia API failed to load');
            }, 2000);

            //request Wikipedia API information and add to info window
            $.ajax({
                url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
                    marker.title + '&format=json',
                dataType: "jsonp",
                success: function(response) {
                    var url = "";
                    var html = '<h3>' + response[0] + '</h3>';
                    if (response[1].length) {
                        html += '<br><h4><em>Wikipedia Articles:</em></h4><ul>';
                        for (var i = 0; i < response[1].length; i++){
                            url = response[3][i];
                            html += '<li><a href="' + url + '">' + response[1][i] + '</a></li>';
                        }
                        html += '</ul>';
                    } else {
                        html += "No Wikipedia Articles Found";
                    }

                    infoWindow.setContent(html);
                    infoWindow.open(map, infoWindow.marker);

                    clearTimeout(wikiRequestTimeout);
                }
            });

            // Make sure the marker property is cleared if the infowindow is closed.
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
        }
    };

    /*function that changes selected, animates marker, and creates info window
    when list item is clicked*/
    this.clickItem = function(data, event) {
        self.selected(data.title);
        self.animateMarker(data.marker);
        self.fillInfoWindow(data.marker);
    };
};

var map;
var bounds;
var infoWindow;

/*//Display error message if Google Maps API fails to load
function mapError(event) {
    alert('An error occurred while loading the Google Maps API.')
};*/

//function that creates map and markers
var initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.584435, lng: -109.54984},
        zoom: 11
    });
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);

    bounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow();

    ko.utils.arrayForEach(viewModel.places(), function(place) {
        place.marker = new google.maps.Marker({
            position: {lat: place.lat, lng: place.lng},
            map: map,
            title: place.title
        });
        bounds.extend(place.marker.position);

        place.marker.addListener('click', function() {
            viewModel.animateMarker(this);
            viewModel.selected(this.title);//change selected variable to clicked marker's title
            viewModel.fillInfoWindow(this);
        });
    });
    map.fitBounds(bounds);

    //Re-fit map when page size changes
    window.addEventListener('resize', function(e) {
      map.fitBounds(bounds);
    });
};

//Apply Knockout bindings to ViewModel
var viewModel = new ViewModel();
ko.applyBindings(viewModel);

//Error handling for Google Maps API
setTimeout(function() {
    if (!(typeof(google) === 'object' && typeof(google.maps) === 'object')) {
        alert('An error occurred while loading the Google Maps API.')
    }
}, 2000);

//Wikipedia API attribution
setTimeout(function() {
    alert('This website uses the Wikipedia API to provide information about places in the Moab area.' +
    ' Just click on any map marker!');
}, 3000);
