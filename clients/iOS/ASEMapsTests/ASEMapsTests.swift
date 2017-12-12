//
//  ASEMapsTests.swift
//  ASEMapsTests
//
//  Created by Ehsan Yazdan Panah on 06/11/2017.
//  Copyright © 2017 Ehsan Yazdan Panah. All rights reserved.
//

import XCTest
@testable import ASEMaps

class ASEMapsTests: XCTestCase {
    var maps: ViewController!
    var maps2: ViewController!
    
    override func setUp() {
        super.setUp()
        // Put setup code here. This method is called before the invocation of each test method in the class.
    }
    
    override func tearDown() {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
        super.tearDown()
    }
    
    func testExample() {
        // This is an example of a functional test case.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
    }
    
    func testPerformanceExample() {
        // This is an example of a performance test case.
        self.measure {
            // Put the code you want to measure the time of here.
        }
    }
    
    func testGetLat() {
        maps = ViewController()
        maps.setCurLat(lat: 50.821120)
        let latTest = 50.821120
        XCTAssertEqual(maps.getCurLat(), latTest, "getCurLat test pass!")
    }
    
    func testGetLon() {
        maps = ViewController()
        maps.setCurLon(lon: -0.1375)
        let lonTest = -0.1375
        XCTAssertEqual(maps.getCurLon(), lonTest, "getCurLon test pass!")
    }
    
    func testGetPostcode() {
        maps = ViewController()
        maps.setPostcode(newPostcode: "BN23PH")
        let postcodeTest = "BN23PH"
        XCTAssertEqual(maps.getPostcode(), postcodeTest, "getPostcode test pass!")
    }
    
    func testGetDeviceID() {
        maps = ViewController()
        let DeviceID = UIDevice.current.identifierForVendor!.uuidString
        maps.setDeviceID(newID: DeviceID)
        let DeviceIDTest = "1BBFADDD-04F2-493C-B3B5-E65CD44C4AFB"
        XCTAssertEqual(maps.getDeviceID(), DeviceIDTest, "getDeviceID test pass!")
    }
    
    func testGetRadius() {
        maps = ViewController()
        maps.setRadius(newRadius: 12)
        let radiusTest = 12
        XCTAssertEqual(maps.getRadius(), radiusTest, "getRadius test pass!")
    }
    
    func testGetLatLonLabel() {
        maps = ViewController()
        let ltlnLabel = UILabel()
        ltlnLabel.text = "Latitude:"
        maps.setLatLonLabel(latlonLabel: ltlnLabel)
        XCTAssertEqual(maps.getLatLonLabel().text, "Latitude:", "getLatLonLabel test pass!")
    }
    
    func testGetPriceLabel() {
        maps = ViewController()
        let priceLabel = UILabel()
        priceLabel.text = "Price:"
        maps.setPriceLabel(priceLabel: priceLabel)
        XCTAssertEqual(maps.getPriceLabel().text, "Price:", "getPriceLabel test pass!")
    }
    
    func testGetIsSearched() {
        maps = ViewController()
        maps.setIsSearche(newIsSearched: true)
        XCTAssertEqual(maps.getIsSearched(), true, "getIsSearched test pass!")
    }
    
    func testGetLatLonList() {
        maps = ViewController()
        var list = [GMUWeightedLatLng]()
        let item = GMUWeightedLatLng(coordinate: CLLocationCoordinate2DMake( 50.821120, -0.1375 ),intensity: 2132)
        list.append(item)
        maps.setLatLonList(newList: list)
        XCTAssertEqual(maps.getLatLonList()[0], item, "getLatLonList test pass!")
    }
    
    func testDismissAlert(){
        maps = ViewController()
        let ltlnLabel = UILabel()
        ltlnLabel.text = "Latitude:"
        XCTAssertNotNil(ltlnLabel)
        maps.setLatLonLabel(latlonLabel: ltlnLabel)
        XCTAssertEqual(maps.getLatLonLabel().text, "Latitude:", "")
        XCTAssertNotEqual(maps.getLatLonLabel().text, "")
        XCTAssertNotNil(maps.getLatLonLabel())
        maps.dismissAlert()
        XCTAssertEqual(maps.getLatLonLabel().text, "", "DismissAlert test pass!")
    }
    
    func testListSizePostcode(){
        maps = ViewController()
        maps2 = ViewController()
        let postcodeTest = "BN23PH"
        var seconds: TimeInterval!
        let DeviceID = UIDevice.current.identifierForVendor!.uuidString
        
        seconds = NSDate().timeIntervalSince1970
        var timeMilliee =  seconds * 1000;
        maps.setDeviceID(newID: DeviceID)
        maps.setTime(millie: timeMilliee)
        maps.setPostcode(newPostcode: postcodeTest)
        maps.setRadius(newRadius: 2)
        maps.getLatLonFromServer()
        let list1 = maps.getLatLonList()
        let size1 = list1.count
        
        seconds = NSDate().timeIntervalSince1970
        timeMilliee =  seconds * 1000;
        maps2.setDeviceID(newID: DeviceID)
        maps2.setTime(millie: timeMilliee)
        maps2.setPostcode(newPostcode: postcodeTest)
        maps2.setRadius(newRadius: 15)
        maps2.getLatLonFromServer()
        let list2 = maps2.getLatLonList()
        let size2 = list2.count
        
        XCTAssertNotEqual(size1, size2)
    }
    
    func testListSizePOSTRequest(){
        maps = ViewController()
        maps2 = ViewController()
        let postcodeTest = "BN23PH"
        var seconds: TimeInterval!
        let DeviceID = UIDevice.current.identifierForVendor!.uuidString
        
        seconds = NSDate().timeIntervalSince1970
        var timeMilliee =  seconds * 1000;
        maps.setDeviceID(newID: DeviceID)
        maps.setTime(millie: timeMilliee)
        maps.setPostcode(newPostcode: postcodeTest)
        maps.setRadius(newRadius: 2)
        maps.setCurLat(lat: 50.821120)
        maps.setCurLon(lon: -0.1375)
        maps.POSTRequest()
        let list1 = maps.getLatLonList()
        let size1 = list1.count
        
        seconds = NSDate().timeIntervalSince1970
        timeMilliee =  seconds * 1000;
        maps2.setDeviceID(newID: DeviceID)
        maps2.setTime(millie: timeMilliee)
        maps2.setPostcode(newPostcode: postcodeTest)
        maps2.setRadius(newRadius: 15)
        maps2.setCurLat(lat: 50.821120)
        maps2.setCurLon(lon: -0.1375)
        maps2.POSTRequest()
        let list2 = maps2.getLatLonList()
        let size2 = list2.count
        
        XCTAssertNotEqual(size1, size2)
    }
}
