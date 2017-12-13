//
//  ViewController.swift
//  ASEMaps
//
//  Created by Ehsan Yazdan Panah on 06/11/2017.
//  Copyright © 2017 Ehsan Yazdan Panah. All rights reserved.
//

import Foundation
import UIKit
import GoogleMaps
import GooglePlaces

//struct entity: Decodable {
//    let ID: String?
//    let lat: Double?
//    let lon: Double?
//    let time: Double?
//    let rad: Int?
//}

// A structure to parse returned data from server to get a list of all returned elements
struct mapsJSON: Decodable {
    let error: Int
    let map: [map]
}

// A structure to parse returned data from server and finding latitude, longitude and price of the returned elements
struct map: Decodable {
    let latitude: Double
    let longitude: Double
    let price: Int
}

// A structure to parse returned data from server and finding latitude and longitude of the searched postcode
struct postcodeLatLon: Decodable {
    let error: Int?
    let latitude: Double?
    let longitude: Double?
}

class ViewController: UIViewController, CLLocationManagerDelegate, UITextFieldDelegate {

    @IBOutlet weak var txf: UITextField!
    var locationManager = CLLocationManager()
    lazy var mapView = GMSMapView()
    var postcode: String!
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var sliderView: UISlider!
    var radius: Int!
    @IBOutlet weak var LatLonLabel: UILabel!
    @IBOutlet weak var PriceLabel: UILabel!
    var CurLat: Double!
    var CurLon: Double!
    var DeviceID: String!
    var seconds: TimeInterval!
    var timeMilliee: Double!
    var isSearched: Bool = false
    private var heatmapLayer: GMUHeatmapTileLayer!
    var list = [GMUWeightedLatLng]()
    var priceList = [Int]()
    var price: String!
    var searchServer = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        DeviceID = UIDevice.current.identifierForVendor!.uuidString
        GMSServices.provideAPIKey("AIzaSyCaR3nziMdORUviY25TDI-2VTZr1klUFeA")
        let camera = GMSCameraPosition.camera(withLatitude: 50.821120, longitude: -0.1375, zoom: 15.0)
        mapView = GMSMapView.map(withFrame: self.view.bounds, camera: camera)
        mapView.isMyLocationEnabled = true
        mapView.settings.myLocationButton = false
        
        txf.delegate = self
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.startUpdatingLocation()
        
        imageView.image = UIImage(named: "icon3.png")
        let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(imageTapped(tapGestureRecognizer:)))
        imageView.isUserInteractionEnabled = true
        imageView.addGestureRecognizer(tapGestureRecognizer)
        
        sliderView.maximumValue = 15
        sliderView.minimumValue = 1
        sliderView.isContinuous = false
        
        heatmapLayer = GMUHeatmapTileLayer()
        
        self.view.addSubview(mapView)
        self.mapView.addSubview(txf)
        self.mapView.bringSubview(toFront: txf)
        self.mapView.addSubview(imageView)
        self.mapView.bringSubview(toFront: imageView)
        self.mapView.addSubview(sliderView)
        self.mapView.bringSubview(toFront: sliderView)
        
        //CurLat = 50.821120
        //CurLon = -0.1375
        radius = 2
    }
    
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
 
    
    /*
     - This fucntion updates the camera (i.e. the view) on the map based on the searched location. It shows the current location if users tap the current location button, otherwise shows the location of the searched postcode.
     */
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if isSearched == false{
            let userLocation = locations.last
            let camera = GMSCameraPosition.camera(withLatitude: userLocation!.coordinate.latitude,
                                                  longitude: userLocation!.coordinate.longitude, zoom: 15.0)
            mapView = GMSMapView.map(withFrame: self.view.bounds, camera: camera)
            mapView.isMyLocationEnabled = false
            locationManager.stopUpdatingLocation()
            CurLat = userLocation?.coordinate.latitude
            CurLon = userLocation?.coordinate.longitude
            
            let marker = GMSMarker()
            marker.position = CLLocationCoordinate2D(latitude: (userLocation?.coordinate.latitude)!, longitude: (userLocation?.coordinate.longitude)!)
            marker.title = "Your Location"
            marker.map = mapView
            
            //CurLat = userLocation?.coordinate.longitude
            //CurLon = userLocation?.coordinate.longitude
            //updateLabels()
            
        } else{
            let camera = GMSCameraPosition.camera(withLatitude: CurLat,
                                                  longitude: CurLon, zoom: 15.0)
            mapView = GMSMapView.map(withFrame: self.view.bounds, camera: camera)
            mapView.isMyLocationEnabled = false
            
            let marker = GMSMarker()
            marker.position = CLLocationCoordinate2D(latitude: CurLat, longitude: CurLon)
            marker.title = "Postcode: " + postcode
            marker.map = mapView
            
            locationManager.stopUpdatingLocation()
        }
        
        self.view.addSubview(mapView)
        self.view.addSubview(txf)
        self.mapView.bringSubview(toFront: txf)
        self.view.addSubview(imageView)
        self.mapView.bringSubview(toFront: imageView)
        self.view.addSubview(sliderView)
        self.view.bringSubview(toFront: sliderView)
        updateLabels()
    }
    
    /*
     - This is executed once users tap the current location button in the right-bottom of the screen
     */
    @objc func imageTapped(tapGestureRecognizer: UITapGestureRecognizer){
        isSearched = false
        //locationManager.startUpdatingLocation()
        
        let myloc = locationManager.location?.coordinate
        _ = tapGestureRecognizer.view as! UIImageView
        CurLat = myloc?.latitude
        CurLon = myloc?.longitude
        
        POSTRequest()
    }
    
    /*
     - This function is executed every time users press the return button after typeing a text in a textfield
     - This function calls the function 'getLatLonFromServer' to find the latitude and longitude of the typed postcode.
     */
    func textFieldShouldReturn(_ scoreText: UITextField) -> Bool {
        postcode = txf.text!
        isSearched = true
        getLatLonFromServer()
        
        self.view.endEditing(true)
        return true
    }
    
    /*
     - This function make a HTTP POST request to find the latitude and longitude of the searched postcode using the unique device id and the postcode.
     - It execute the function 'POSTRequest' to get the heat map for the searched postcode
     */
    func getLatLonFromServer(){
        isSearched = true
        var lt: Double!
        var ln: Double!
        seconds = NSDate().timeIntervalSince1970
        timeMilliee =  seconds * 1000;
        let parameters = ["id": DeviceID, "time": timeMilliee, "postcode": postcode] as [String: Any]
        guard let url = URL(string: "http://35.176.239.74:80/postcode/reverse") else {return}
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        guard let httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: []) else {return}
        request.httpBody = httpBody
        
        let session = URLSession.shared
        session.dataTask(with: request) { (data, response, error) in
            if let response = response {
                print(response)
            }
            
            if let data = data {
                do{
                    let j = try JSONDecoder().decode(postcodeLatLon.self, from: data)
                    lt = Double(j.longitude!)
                    ln = Double(j.latitude!)
                    self.CurLat = lt
                    self.CurLon = ln
                    
                    
                    DispatchQueue.global(qos: .background).async {
                        DispatchQueue.main.async {
                            self.POSTRequest()
                        }
                    }
                } catch {
                    print(error)
                }
            }
        }.resume()
    }
    
    /*
     - This function make a HTTP POST request to our server and gets the data for the search location (i.e. latitude and longitude) using the unique device id and the time that user searched the location followed by the radius for heat map.
     */
    func POSTRequest(){
        list.removeAll()
        locationManager.startUpdatingLocation()
        seconds = NSDate().timeIntervalSince1970
        timeMilliee =  seconds * 1000;
        radius = radius * 1000
        
        let parameters = ["id": DeviceID, "longitude": CurLat, "latitude": CurLon, "time": timeMilliee, "radius": radius] as [String: Any]
        guard let url = URL(string: "http://35.176.239.74:80/price/map") else {return}
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        guard let httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: []) else {return}
        request.httpBody = httpBody
        
        let session = URLSession.shared
        session.dataTask(with: request) { (data, response, error) in
            if let response = response {
                print(response)
            }
            if let data = data {
                do{
                    self.searchServer = true
                    let j = try JSONDecoder().decode(mapsJSON.self, from: data)
                    for item in j.map{
                        self.priceList.append(item.price)
                        self.list.append(GMUWeightedLatLng(coordinate: CLLocationCoordinate2DMake(item.longitude, item.latitude),intensity: Float(item.price)))
                    }
                } catch {
                    print(error)
                }
                
                DispatchQueue.global(qos: .background).async {
                    DispatchQueue.main.async {
                        self.addHeatmap(list: self.list)
                    }
                }
            }
            
            }.resume()
        
    }
    
    /*
     - This function creates and updates the labels according to the searched location
     */
    func updateLabels(){
         LatLonLabel.backgroundColor = UIColor.white
         LatLonLabel.layer.cornerRadius = 8.0
         LatLonLabel.layer.opacity = 1.0
         LatLonLabel.textColor = UIColor.black
        let lt = Double(round(CurLat*100000)/100000)
        let ln = Double(round(CurLon*100000)/100000)
         LatLonLabel.text = "Latitude: " + String(lt) + "\nLongitude: " + String(ln)
         self.view.addSubview(LatLonLabel)
         Timer.scheduledTimer(timeInterval: 3.0, target: self, selector: #selector(self.dismissAlert), userInfo: nil, repeats: false)
        /*
        print("price list size is: ", String(priceList.count))
        if (priceList.count > 0){
            PriceLabel.backgroundColor = UIColor.white
            PriceLabel.layer.cornerRadius = 8.0
            PriceLabel.layer.opacity = 1.0
            PriceLabel.textColor = UIColor.black
            if (postcode != nil){
                PriceLabel.text = "Price for " + postcode + ": " + String(priceList[1])
            } else if (isSearched == false){
                PriceLabel.text = "Price for your location: " + String(priceList[1])
            }
            //PriceLabel.text = "Price for [POSTCODE]: Data From Server..."
            self.view.addSubview(PriceLabel)
        }
         */
        if (priceList.count == 0 && searchServer == true){
            PriceLabel.backgroundColor = UIColor.white
            PriceLabel.layer.cornerRadius = 8.0
            PriceLabel.layer.opacity = 1.0
            PriceLabel.textColor = UIColor.black
            PriceLabel.text = "No data found..."
            //Timer.scheduledTimer(timeInterval: 3.0, target: self, selector: #selector(self.dismissAlert), userInfo: nil, repeats: false)
            self.view.addSubview(PriceLabel)
        }
    }
    
    /*
     - This function detects any changes on slider and changed the value of radius to update the heat map
     */
    @IBAction func SliderValueChanged(_ sender: Any) {
        radius = Int(sliderView.value)
        //print("Radius Value: ", radius)
        POSTRequest()
    }
    
    /*
     - This function removes labels from the screen
     */
    @objc func dismissAlert(){
        if LatLonLabel != nil{
            LatLonLabel.text = ""
            LatLonLabel.layer.opacity = 0.0
        }
        if PriceLabel != nil {
            PriceLabel.text = ""
            PriceLabel.layer.opacity = 0.0
        }
    }
    
    /*
     -
    */
    func addHeatmap( list: [GMUWeightedLatLng] )  {
        heatmapLayer = GMUHeatmapTileLayer()
        print("HeatMap")
        print("Size: ", list.count)
        heatmapLayer.weightedData = list
        heatmapLayer.map = mapView
    }
    
    /*
     - Getters functions
    */
    func getCurLat() -> Double {return CurLat}
    func getCurLon() -> Double {return CurLon}
    func getDeviceID() -> String {return DeviceID}
    func getIsSearched() -> Bool {return isSearched}
    func getPostcode() -> String {return postcode}
    func getLatLonList() -> [GMUWeightedLatLng] {return list}
    func getRadius() -> Int {return radius}
    func getLatLonLabel() -> UILabel {return LatLonLabel}
    func getPriceLabel() -> UILabel {return PriceLabel}
    func getTime() -> Double {return timeMilliee}
    
    /*
     - Setter functions
     */
    func setCurLat(lat: Double) {CurLat = lat}
    func setCurLon(lon: Double) {CurLon = lon}
    func setDeviceID(newID: String) {DeviceID = newID}
    func setIsSearche(newIsSearched: Bool) {isSearched = newIsSearched}
    func setPostcode(newPostcode: String) {postcode = newPostcode}
    func setLatLonList(newList: [GMUWeightedLatLng]) {list = newList}
    func setRadius(newRadius: Int) {radius = newRadius}
    func setLatLonLabel(latlonLabel: UILabel) {LatLonLabel = latlonLabel}
    func setPriceLabel(priceLabel: UILabel) {PriceLabel = priceLabel}
    func setTime(millie: Double) {timeMilliee = millie}
 
}
