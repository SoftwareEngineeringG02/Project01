//
//  ViewController.swift
//  ASEMaps
//
//  Created by Ehsan Yazdan Panah on 06/11/2017.
//  Copyright © 2017 Ehsan Yazdan Panah. All rights reserved.
//

import UIKit
import GoogleMaps
import GooglePlaces

class ViewController: UIViewController, CLLocationManagerDelegate, UITextFieldDelegate {

    @IBOutlet weak var txf: UITextField!
    var locationManager = CLLocationManager()
    lazy var mapView = GMSMapView()
    var postcode: String!
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var sliderView: UISlider!
    var mapZoom: Int!
    //private var heatmapLayer: GMUHeatmapTileLayer!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        GMSServices.provideAPIKey("AIzaSyCaR3nziMdORUviY25TDI-2VTZr1klUFeA")
        let camera = GMSCameraPosition.camera(withLatitude: 50.821120, longitude: -0.1375, zoom: 15.0)
        //mapView = GMSMapView.map(withFrame: CGRect.zero, camera: camera)
        mapView = GMSMapView.map(withFrame: self.view.bounds, camera: camera)
        mapView.isMyLocationEnabled = true
        mapView.settings.myLocationButton = false
        
        let marker = GMSMarker()
        marker.position = CLLocationCoordinate2D(latitude: 50.821120, longitude: -0.1375)
        marker.title = "Brighton"
        marker.snippet = "United Kingdom"
        marker.map = mapView
        
        txf.delegate = self
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.startUpdatingLocation()
        
        imageView.image = UIImage(named: "icon2.png")
        let tapGestureRecognizer = UITapGestureRecognizer(target: self, action: #selector(imageTapped(tapGestureRecognizer:)))
        imageView.isUserInteractionEnabled = true
        imageView.addGestureRecognizer(tapGestureRecognizer)
        
        mapZoom = 15
        sliderView.minimumValue = 5
        sliderView.maximumValue = 15
        sliderView.value = 15
        sliderView.isContinuous = false
                
        self.view.addSubview(mapView)
        self.mapView.addSubview(txf)
        self.mapView.bringSubview(toFront: txf)
        self.mapView.addSubview(imageView)
        self.mapView.bringSubview(toFront: imageView)
        self.mapView.addSubview(sliderView)
        self.mapView.bringSubview(toFront: sliderView)
        
        
//        heatmapLayer = GMUHeatmapTileLayer()
//        heatmapLayer.map = mapView
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        let userLocation = locations.last
//        let camera = GMSCameraPosition.camera(withLatitude: userLocation!.coordinate.latitude,
//                                              longitude: userLocation!.coordinate.longitude, zoom: 15.0)
        let camera = GMSCameraPosition.camera(withLatitude: userLocation!.coordinate.latitude,
                                              longitude: userLocation!.coordinate.longitude, zoom: Float(mapZoom))
        mapView = GMSMapView.map(withFrame: self.view.bounds, camera: camera)
        mapView.isMyLocationEnabled = true
        locationManager.stopUpdatingLocation()
        
        self.view.addSubview(mapView)
        self.view.addSubview(txf)
        self.mapView.bringSubview(toFront: txf)
        self.view.addSubview(imageView)
        self.mapView.bringSubview(toFront: imageView)
        self.view.addSubview(sliderView)
        self.mapView.bringSubview(toFront: sliderView)
    }
    
    @objc func imageTapped(tapGestureRecognizer: UITapGestureRecognizer)
    {
        let myloc = locationManager.location?.coordinate
        let camera = GMSCameraPosition.camera(withLatitude: (myloc?.latitude)!,
                                              longitude: (myloc?.longitude)!, zoom: 15.0)
        mapView = GMSMapView.map(withFrame: self.view.bounds, camera: camera)
        //CLLocationCoordinate2D myLocation = self.mapView.myLocation.coordinate;
        print("CL Pressed")
        _ = tapGestureRecognizer.view as! UIImageView
        self.locationManager.startUpdatingLocation()
        // Your action
    }
    
    
    func textFieldShouldReturn(_ scoreText: UITextField) -> Bool {
        postcode = txf.text!
        print(postcode)
        let URLGetRequst = "https://api.postcodes.io/postcodes?q=" + postcode
        
        guard let url = URL(string: "https://api.postcodes.io/postcodes?q=BN11HG") else{return false}
        let session = URLSession.shared
        session.dataTask(with: url){ (data, response, error) in
            if let response = response{
                print("Res: ",response)
            }
            if let data = data {
                print("Data: ",data)
                do{
                    let json = try JSONSerialization.jsonObject(with: data, options: []) as! [String:AnyObject]
                    if let lat = json["latitude"] as? [String]{
                        print(lat)
                    }
                    /*
                     if let dictionary = json {
                     if let nestedDictionary = dictionary["result"] as? [String: Any] {
                     // access nested dictionary values by key
                     for (key, value) in nestedDictionary {
                     // access all key / value pairs in dictionary
                     print("key: ", key)
                     print("val: ", value)
                     }
                     }
                     }
                     */
                    print("json: ", json)
                    
                } catch{
                    print(error)
                }
            }
            
            }.resume()
        
        
        /*
         let urlString = URL(string: "http://api.postcodes.io/postcodes?q=" + postcode)
         if let url = urlString {
         print("11111")
         _ = URLSession.shared.dataTask(with: url) { (data, response, error) in
         if error != nil {
         print(error)
         } else {
         if let usableData = data {
         print(usableData) //JSONSerialization
         }
         }
         }
         }
         */
        print("=====================================")
        print("URL: " + URLGetRequst)
        self.view.endEditing(true)
        return true
    }
    
    func httpPost(){
        let parameters = ["id": "value", "latitude": "value", "longitude": "value"]
        
        guard let url = URL(string: "https://api.postcodes.io/postcodes?q=BN11HG") else {return}
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        guard let httpBody = try? JSONSerialization.data(withJSONObject: parameters, options: []) else {return}
        request.httpBody = httpBody
        
        let session = URLSession.shared
        session.dataTask(with: request) { (data, response, error) in
            if let response = response {
                print(response)
            }
            
            if let data = data {
                do{
                    let json = try JSONSerialization.jsonObject(with: data, options: [])
                    print(json)
                } catch {
                    print(error)
                }
            }
            }.resume()
    }
    
    
    @IBAction func sliderValueChanged(_ sender: Any) {
        mapZoom = Int(sliderView.value)
        print(mapZoom)
        locationManager.startUpdatingLocation()
    }
    
    
    // Function CLocation, which shows the current location of the device once the button "Current Location" is pressed
    
    // Show Current Location (Function)
    
    // PUT request to send the searched Latitude and Longitudeand
    
    // PUSH request to find the relevent Latitude and Longitude for the searched Postcode, this postcode
    // has been stored in our database

}
