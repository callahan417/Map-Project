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
        title: "Utah State Route 128",//Utah State Route 128
        lat: 38.601864,
        lng: -109.575358,
        category: 'Food/Beverage'
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

    //The code below for filtering the this.places() array was adapted from
    //http://stackoverflow.com/questions/20857594/knockout-filtering-on-observable-array
    this.currentFilter = ko.observable(); //the category to use for filtering
    var self = this;
    this.filterPlaces = ko.computed(function() {
        if(!this.currentFilter() || this.currentFilter() === "All") {//TODO: remove !this.currentFilter()?
            return this.places();
        } else {
            return ko.utils.arrayFilter(this.places(), function(place) {
                return place.category === self.currentFilter();
            });
        }
    }, this);

    //function that hides/shows list when hamburger icon is clicked
    this.toggleList = function() {
        /*$('#list-container').toggleClass('hidden');*/
        this.hideList(!this.hideList());//**
    };

    this.filterMarkers = function() {
        //In a change event handler, this refers to the outer (viewModel) context
        //console.log(this.places()[0].marker);
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
    };

    this.animateMarker = function(marker) {
        marker.setAnimation(google.maps.Animation.DROP);
        setTimeout(function() {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }, 500);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 4000);
    };

    this.fillInfoWindow = function(marker) {
        console.log(marker);
        console.log(map);

        //TODO: Start fillInfoWindow here...
        //Change the infoWindow (content and position) if the clicked marker/item has changed
        if (infoWindow.marker != marker) {//TODO: change 'this' to 'marker' #
            infoWindow.marker = marker;//TODO: change 'this' to 'marker' #
            //console.log(this);
            infoWindow.setContent("Requesting Wikipedia API...");//TODO: delete?
            infoWindow.open(map, infoWindow.marker);

            var wikiRequestTimeout = setTimeout(function() {
                infoWindow.setContent('Error: The Wikipedia API failed to load');
            }, 6000);

            $.ajax({
                url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
                    marker.title + '&format=json',//TODO: change 'this' to 'marker' #
                dataType: "jsonp",
                //jsonp: "callback", (included for APIs that use a different name for the callback function)
                success: function(response) {
                    //console.log(response);
                    var url = "";
                    var html = '<h3>' + response[0] + '</h3>';
                    if (response[1].length) {
                        html += '<br><h4><em>Wikipedia Articles:</em></h4><ul>';
                        for (var i = 0; i < response[1].length; i++){
                            url = response[3][i];
                            html += '<li><a href="' + url + '">' + response[1][i] + '</a></li>';
                        }
                        html += '</ul>'
                    } else {
                        html += "No Wikipedia Articles Found";
                    }

                    infoWindow.setContent(html);
                    infoWindow.open(map, infoWindow.marker);

                    clearTimeout(wikiRequestTimeout);
                }
            });
            /*.fail(function() {
                alert('Failure');
                infoWindow.setContent('An error occurred while searching Wikipedia');
            });*/

            //console.log(infoWindow.getContent());
            // Make sure the marker property is cleared if the infowindow is closed.
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
            //infoWindow.open(map, this);
        }//TODO: END fillInfoWindow here...
    };

    //function that changes styling on list item when it is clicked
    this.clickItem = function(data, event) {
        //In a click handler function, this refers to the object corresponding
        //to the DOM element that was clicked

        //TODO:Delete code below that changes highlighted item (covered by line below)
        /*$(event.target).addClass('highlighted');
        $(event.target).siblings('.highlighted').removeClass('highlighted');//TODO: remove $()?*/

        self.selected(data.title);

        self.animateMarker(data.marker);

        self.fillInfoWindow(data.marker);
    };
};

var map;
var bounds;
var infoWindow;

var initMap = function() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.584435, lng: -109.54984},
        zoom: 11
    });
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);

    bounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow;

    ko.utils.arrayForEach(viewModel.places(), function(place) {
        place.marker = new google.maps.Marker({
            position: {lat: place.lat, lng: place.lng},
            map: map,
            title: place.title
        });
        bounds.extend(place.marker.position);

        place.marker.addListener('click', function() {
            //Within the click listener, this is the marker that was clicked
            //Animate marker
            viewModel.animateMarker(this);

            //TODO: Delete code below that changes highlighted item (covered by line under it)
            /*//If the clicked marker (this) does not match the highlighted list item,
            if ($('li.highlighted').text() !== this.title) {
                $('li.highlighted').removeClass('highlighted');//remove highlighting from list item
                //Highlight the list item corresponding to the clicked marker
                items = $('li').toArray();
                items.forEach(function(element) {
                    if ($(element).text() === this.title) {
                        $(element).addClass('highlighted');
                    }
                }, this);
            }*/

            viewModel.selected(this.title);//change selected variable to clicked marker's title

            viewModel.fillInfoWindow(this);
            /*//TODO:Delete code below that creates info window (covered by above function call)
            if (infoWindow.marker != this) {
                infoWindow.marker = this;
                //console.log(this);
                infoWindow.setContent("Searching...");

                var wikiRequestTimeout = setTimeout(function() {
                    infoWindow.setContent('An error occurred while searching Wikipedia');
                }, 8000);

                $.ajax({
                    url: 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
                        this.title + '&format=json',
                    dataType: "jsonp",
                    //jsonp: "callback", (included for APIs that use a different name for the callback function)
                    success: function(response) {
                        //console.log(response);
                        var url = "";
                        var html = '<h3>' + response[0] + '</h3>';
                        if (response[1].length) {
                            html += '<br><h4><em>Wikipedia Articles:</em></h4><ul>';
                            for (var i = 0; i < response[1].length; i++){
                                url = response[3][i];
                                html += '<li><a href="' + url + '">' + response[1][i] + '</a></li>';
                            }
                            html += '</ul>'
                        } else {
                            html += "No Wikipedia Articles Found";
                        }

                        infoWindow.setContent(html);
                        infoWindow.open(map, infoWindow.marker);

                        clearTimeout(wikiRequestTimeout);
                    }
                });
                /*.fail(function() {
                    alert('Failure');
                    infoWindow.setContent('An error occurred while searching Wikipedia');
                });*//*

                //console.log(infoWindow.getContent());
                // Make sure the marker property is cleared if the infowindow is closed.
                infoWindow.addListener('closeclick', function() {
                    infoWindow.marker = null;
                });
                //infoWindow.open(map, this);
            }*/
        });
    });
    map.fitBounds(bounds);

    window.addEventListener('resize', function(e) {
      //Re-fit map when page size changes
      map.fitBounds(bounds);
    });
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

setTimeout(function() {
    alert('This website uses the Wikipedia API to provide information about places in the Moab area.' +
    ' Just click on any map marker!');
}, 3000);
//console.log(viewModel.places());
