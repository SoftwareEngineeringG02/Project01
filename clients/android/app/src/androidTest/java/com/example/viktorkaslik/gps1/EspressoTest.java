package com.example.viktorkaslik.gps1;


//import org.junit.Test;

import android.app.Activity;
import android.content.Context;
import android.location.LocationManager;
import android.location.LocationProvider;
import android.support.test.rule.ActivityTestRule;
import android.support.test.runner.AndroidJUnit4;
import android.test.suitebuilder.annotation.LargeTest;
import android.support.test.espresso.Espresso;
import android.util.Log;

import com.google.maps.android.heatmaps.WeightedLatLng;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.List;
import java.util.logging.Logger;

import static android.support.test.espresso.assertion.ViewAssertions.matches;
import static android.support.test.espresso.matcher.ViewMatchers.isDisplayed;
import static android.support.test.espresso.matcher.ViewMatchers.withId;
import static android.support.test.espresso.matcher.ViewMatchers.withText;
import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
*/
@RunWith(AndroidJUnit4.class)
@LargeTest

public class EspressoTest {

    @Rule
    public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule(MainActivity.class);

    @Test
    public void gettingHeatMaptDataFromServer(){
        MainActivity ma = new MainActivity();
        ma.tempGetMap();
        List<WeightedLatLng> temp = ma.getHeatMapData();
        assertTrue(temp.size() > 0);
    }


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
