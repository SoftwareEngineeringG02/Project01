package com.example.viktorkaslik.gps1;


import android.test.suitebuilder.annotation.LargeTest;
//import org.junit.Test;
import org.junit.Test;
import org.junit.runner.RunWith;



import static org.junit.Assert.*;

/**
 * Example local unit test, which will execute on the development machine (host).
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
*/

public class ExampleUnitTest {
    @Test
    public void additionIsCorrect() throws Exception {
        // Define a LocationClient object

        assertEquals(4, 2 + 2);
    }




//    @Test
//    public void test2(){
//        System.out.println("testing2 ...");
//        MainActivity ma = new MainActivity();
//        double[] expected = {5.6,2.35};
//        System.out.println("testing3 ...");
//        //TestLocationProvider tlp = new TestLocationProvider();
//        TestLocationProvider.sendLocation(2.35, 5.6);
//        System.out.println("testing5 ...");
//        ma.getLoc();
//        ma.getLonLat();
//        double[] lonlat = ma.getLonLat();
//
//        assertTrue(Arrays.equals(expected, lonlat));
//
//    }


    //TEST
    // Cache
    // 404 errors
    // 200 errors
    // auto locate disabled // and enabled

}
