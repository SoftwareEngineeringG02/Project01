package com.example.viktorkaslik.gps1;

import android.content.Context;
import android.location.Location;
import android.location.LocationManager;

/**
 * Created by viktorkaslik on 14/11/2017.
 */

public class MockLocationProvider {
    String providerName;
    Context ctx;

    public MockLocationProvider(String name, Context ctx) {
        this.providerName = name;
        this.ctx = ctx;

        LocationManager lm = (LocationManager) ctx.getSystemService(Context.LOCATION_SERVICE);
        lm.addTestProvider(providerName, false, false, false, false, false, true, true, 0, 5);
        lm.setTestProviderEnabled(providerName, true);
    }

    public void pushLocation(double lat, double lon) {
        LocationManager lm = (LocationManager) ctx.getSystemService(Context.LOCATION_SERVICE);

        Location mockLocation = new Location(providerName);
        mockLocation.setLatitude(lat);
        mockLocation.setLongitude(lon);
        mockLocation.setAltitude(0);
        mockLocation.setAccuracy((float) 0.5);
        mockLocation.setVerticalAccuracyMeters((float)1.0);
        mockLocation.setSpeedAccuracyMetersPerSecond((float) 0.5);
        mockLocation.setBearingAccuracyDegrees((float) 0.5);
        mockLocation.setElapsedRealtimeNanos(10000);
        mockLocation.setTime(System.currentTimeMillis());
        lm.setTestProviderLocation(providerName, mockLocation);
    }

    public void shutdown() {
        LocationManager lm = (LocationManager) ctx.getSystemService(
                Context.LOCATION_SERVICE);
        lm.removeTestProvider(providerName);
    }
}