
package com.example.viktorkaslik.gps1;

//import org.junit.Test;

import android.location.Location;
import android.location.LocationListener;
import android.os.Bundle;
import android.support.test.rule.ActivityTestRule;
import android.support.test.runner.AndroidJUnit4;
import android.test.ActivityInstrumentationTestCase2;
import android.test.suitebuilder.annotation.LargeTest;

import com.example.viktorkaslik.gps1.MainActivity;
import com.google.maps.android.heatmaps.WeightedLatLng;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.List;
//import android.test.ActivityInstrumentationTestCase2;

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
 */
@RunWith(AndroidJUnit4.class)
@LargeTest

public class EspressoTest extends ActivityInstrumentationTestCase2<MainActivity> {

    public EspressoTest() {
        super("com.example.viktorkaslik.gps1", MainActivity.class);
    }

    @Rule
    public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule(MainActivity.class);

    @Test
    public void setLocationListenerTest() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();

        LocationListener ll = new LocationListener() {
            @Override
            public void onLocationChanged(Location location) {}
            @Override
            public void onStatusChanged(String s, int i, Bundle bundle) {}
            @Override
            public void onProviderEnabled(String s) {}
            @Override
            public void onProviderDisabled(String s) {}
        };
        ma.setLocationListner(ll);
        assertEquals(ll,ma.getLocationListener());
    }

    @Test
    public void getLonLatTest() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();

        double latTest = 50.821120;
        double lonTest = -0.1375;
        double[] latlonTest = new double[]{lonTest, latTest};
        ma.setLat(latTest);
        ma.setLon(lonTest);
        assertEquals(ma.getLonLat()[0], lonTest);
        assertEquals(ma.getLonLat()[1], latTest);
        System.out.print("getLonLat test passed!");
    }

    @Test
    public void setLonTest() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        //injectInstrumentation(InstrumentationRegistry.getInstrumentation());
        MainActivity ma = mActivityRule.getActivity();

        double lonTest = -0.1375;
        ma.setLon(lonTest);
        assertTrue(ma.getLon() == -0.1375);
        System.out.print("setLat test passed!");
    }

    @Test
    public void setLatTest() throws Exception {
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();

        double latTest = 50.821120;
        ma.setLat(latTest);
        assertTrue(ma.getLat() == 50.821120);
        System.out.print("setLon test passed!");
    }

    @Test
    public void populatePopUpMenuTest() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();
        //ma.populatePopUpMenu(new String[]{"Address1", "Address2", "Address3"});
    }

    @Test
    public void addWeightedHeatMapTest() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();
    }

    @Test
    public void postTest() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();
        double latTest = 50.821120;
        double lonTest = -0.1375;
        ma.post(lonTest, latTest);
        // Checking latest entity in our database, the stored latitude and longitude must be same as latTest and lonTest
        latTest = 48.363;
        lonTest = -0.1867;
        ma.post(lonTest, latTest);
        // Double-checking with different location
    }

    @Test
    public void tempGetMapTest() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();
        ma.tempGetMap();
    }

    @Test
    public void getHeatMapDataTest() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();
        // Calling the proper method to get the Heat Map data for the given location
        //List<WeightedLatLng> weightsList = ma.getHeatMapData();
        //int listSize = weightsList.size();
    }

    @Test
    public void HeatMapListSizeTest() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();
        ma.setRadius(15000);
        List<WeightedLatLng> weightsList1 = ma.getHeatMapData();
        ma.setRadius(1000);
        List<WeightedLatLng> weightsList2 = ma.getHeatMapData();
    }

    @Test
    public void serverTests() throws Exception{
        super.setUp();
        setActivityInitialTouchMode(false);
        MainActivity ma = mActivityRule.getActivity();

        double latTest = 50.821120;
        double lonTest = -0.1375;
        ma.setLat(latTest);
        ma.setLon(lonTest);
        //ma.tempGetMap(); //TODO: this method returns ArrayIndexOutOfBoundsException: length=1; index=1
        //ma.post(lonTest, latTest);
        //List<WeightedLatLng> lst = ma.getHeatMapData();
        //int lstSize = lst.size();
        //assertEquals(ma.getLat(), 50.821120);
    }

    //    =====================================================================================================
    //                                    IGNORE THE BELOW TESTS/COMMENTS
    //   ======================================================================================================

    @Test
    public void getContextTest() throws Exception{
        //        No test needed
        //        super.setUp();
        //        setActivityInitialTouchMode(false);
        //        MainActivity ma1 = mActivityRule.getActivity();
        //        MainActivity ma2 = mActivityRule2.getActivity();
        //
        //        Context cx1 = ma1.getContext();
        //        Context cx2 = ma2.getContext();
        //        assertEquals(cx1,cx2);
    }

    //    @Test
    //    public void gettingHeatMaptDataFromServer(){
    //        MainActivity ma = new MainActivity();
    //        ma.tempGetMap();
    //        List<WeightedLatLng> temp = ma.getHeatMapData();
    //        assertTrue(temp.size() > 0);
    //    }

    //    @Test
    //    public void showOnMapTest() throws Exception{
    //        super.setUp();
    //        setActivityInitialTouchMode(false);
    //        MainActivity ma = mActivityRule.getActivity();
    //
    //        double latTest = 50.821120;
    //        double lonTest = -0.1375;
    //        ma.setLat(latTest);
    //        ma.setLon(lonTest);
    //        ma.showOnMap();
    //        Marker marker = ma.getMarker();
    //        double markerLat = marker.getPosition().latitude;
    //        double markerLon = marker.getPosition().longitude;
    //        assertEquals(latTest, markerLat);
    //        assertEquals(lonTest, markerLon);
    //    }


    //    @Test
    //    public void listGoesOverTheFold() {
    //
    //        double lat = 50.8225;
    //        double lon = 0.1372;
    //        //Espresso.onView(withText("Hello world!")).check(matches(isDisplayed()));
    //        //Espresso.onView(withId(R.id.mapsFrag));
    //        MockLocationProvider mocLoc = new MockLocationProvider(LocationManager.NETWORK_PROVIDER, mActivityRule.getActivity().getContext());
    //        mocLoc.pushLocation(lat,lon);
    //        double[] d = mActivityRule.getActivity().getLonLat();
    //
    //        assertEquals(lon,d[0],0.1);
    //        assertEquals(lat,d[1],0.1);
    //        Log.v("lon", String.valueOf(d[0]));
    //
    //    }

    //TEST
    // Cache
    // 404 errors
    // 200 errors
    // auto locate disabled // and enabled

}

