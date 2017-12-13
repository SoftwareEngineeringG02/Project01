package com.example.viktorkaslik.gps1;

import android.Manifest;
import android.content.ContentResolver;
import android.content.Context;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.AsyncTask;
import android.provider.Settings;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputMethodManager;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.PopupMenu;
import android.widget.SeekBar;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.google.android.gms.maps.model.TileOverlay;
import com.google.android.gms.maps.model.TileOverlayOptions;
import com.google.android.gms.maps.model.TileProvider;
import com.google.maps.android.heatmaps.Gradient;
import com.google.maps.android.heatmaps.HeatmapTileProvider;
import com.google.maps.android.heatmaps.WeightedLatLng;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;


public class MainActivity extends AppCompatActivity implements OnMapReadyCallback {

    private Marker mark;
    private double lon,lat;
    private LocationManager locationManager;
    private EditText address = null;
    private GoogleMap map;
    private TileProvider mProvider;
    private TileOverlay mOverlay;
    private Stack cache;
    private Boolean autoLocate;
    private PopupMenu popUpMenu;
    private Switch locationSwitch;
    private TextView priceView;
    private SupportMapFragment mapFragment;
    private LocationListener locationListener;
    private int radius;
    private SeekBar seekbar;
    private String postcode;
    List<WeightedLatLng> heatMapList;



    //@SuppressLint("NewApi")
    //@RequiresApi(api = Build.VERSION_CODES.KITKAT)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        /* sets up the app and replaces the default toolbar with custom toolbar*/
        setContentView(R.layout.activity_main);
        View myToolbar =  findViewById(R.id.my_toolbar);
        setSupportActionBar((android.support.v7.widget.Toolbar) myToolbar);

        setLocationListner( new MyLocationListener() );
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);

        radius = 15000;
        autoLocate = true;
        locationSwitch = (Switch) findViewById(R.id.switch1);
        locationSwitch.setChecked(true);
        locationSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                    autoLocate = isChecked;
            }
        });

        //Sets up the box to display a postcodes price and hides it
        priceView = (TextView) findViewById(R.id.priceDisplay);
        priceView.setVisibility(View.INVISIBLE);
        priceView.setTextSize((float) 22.5);

        //lock screen orentation
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

        //get the intit location and set up
        getLoc();

        seekbar = (SeekBar) findViewById(R.id.radiusSlider);
        seekbar.setMax(14);
        seekbar.setProgress(10);
        seekbar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
            int progressChangedValue = 0;

            public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                radius = (progress+1)*1000;
            }

            public void onStartTrackingTouch(SeekBar seekBar) {
                // TODO Auto-generated method stub
            }

            public void onStopTrackingTouch(SeekBar seekBar) {
                Toast.makeText(MainActivity.this, "Radius is set to:" + (radius/1000)+"km",
                        Toast.LENGTH_SHORT).show();
                tempGetMap();
            }
        });


        //Set up the map (as a fragment)
        mapFragment = (SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.mapsFrag);
        mapFragment.getMapAsync(this);

        //postcode search bar settup
        address = (EditText) findViewById(R.id.address);
        address.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            // when text has been entered in search bar and enter hit ...
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if (actionId == EditorInfo.IME_ACTION_DONE) {
                    InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
                    imm.hideSoftInputFromWindow(v.getWindowToken(), 0);
                    postcode = address.getText().toString(); //get entered postcode
                    //TODO: REGEX checker to check that the postcode is valid
                    //display the postcode in a toast bubble
                    Toast toast = Toast.makeText(getApplicationContext(),  postcode, Toast.LENGTH_LONG);
                    toast.show();

                    //TODO: get lonlat from address, disable autoLocate, pass to showOnMap()
                    autoLocate = false; //turn off auto locate
                    locationSwitch.setChecked(false); //turn auto locat switch off

                    //populatePopUpMenu(new String[] {"test","tt"}); //Populate and show menu containing options of addresses at postcode TODO(if multiple)



                    getPostcode(postcode);
                    return true;
                }
                return false;
            }
        });

        cache = new Stack(5);


        popUpMenu = new PopupMenu(this, findViewById(R.id.center));

    }

    public void setLocationListner(LocationListener locList){
        locationListener = locList;
    }



    public Context getContext(){return this;}


    /**
     * Creates and fills a popup window with all the addresses passed to it and
     * attaches their appropriate response (actionListner)
     * @param items String of addresses
     */
    public void populatePopUpMenu(String[] items){
        popUpMenu.getMenu().removeGroup(1);
        //popUpMenu.getMenu().add(groupId, itemId, order, title);
        for(int i = 0; i<items.length; i++)
            popUpMenu.getMenu().add(1,1,i,items[i]);

        //TODO: add onclick actionlistner
        popUpMenu.show();
    }


    /**
     * Adds marker and moves map to location given
     * Calls the heat map function which gets the heat map
     * data for the area and overlays it
     */
    public void showOnMap(){
        // Reduce to 2 D.P for displaying as text
        String s1 = String.format("%.2f", lon);
        String s2 = String.format("%.2f", lat);

        //make a toast bubble to display longitude and latitude
        Toast toast = Toast.makeText(getApplicationContext(), "Longitude: " + s1+ " \nLatitude: " + s2, Toast.LENGTH_LONG);
        toast.show();

        //if a marker is present remove it
        if(mark != null)
            mark.remove();

        //Add marker to map and moce camera to location
        LatLng lL = new LatLng(lon,lat);
        mark = map.addMarker(new MarkerOptions().position(lL));
        mark.setTitle("markerTitle");
        map.moveCamera(CameraUpdateFactory.newLatLng(lL));
        map.setMinZoomPreference(6.0f);
        //TODO: have a timer for how often this can be updated e.g. once every 1or 5 mins
        post(lon,lat); //Post the location to the server

        //TODO: if lon,lat within range of downloaded heatmap dont request new heat map
        //List<WeightedLatLng> list = tempGetMap(); //new ArrayList<WeightedLatLng>();

        //addWeightedHeatMap(list); //Create heatmap
        getPrice();
    }


    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        switch (requestCode) {
            case 1: {
                // If request is cancelled, the result arrays are empty.
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    // permission was granted, yay!

                } else {

                    // permission denied, boo! Disable the
                    // functionality that depends on this permission.
                }

            }

        }
    }




    /**
     * Gets the location and writes it to label
     */
    public void getLoc(){
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 1);
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }
        locationManager.requestLocationUpdates(locationManager.GPS_PROVIDER, 0, 0, locationListener);
    }


    /**
     * Set up map when application loads and place pin at a dummy point
     * incase the GPS service hasn't got a location yet (e.g. on boot)
     * @param map1
     */
    @Override
    public void onMapReady(GoogleMap map1) {
        this.map = map1;
        LatLng lL = new LatLng(50.82, 0.137);
        mark = map.addMarker(new MarkerOptions().position(lL));
        map.moveCamera(CameraUpdateFactory.newLatLng(lL));
        CameraPosition cameraPosition = new CameraPosition.Builder().target(lL).zoom(14.0f).build();
        CameraUpdate cameraUpdate = CameraUpdateFactory.newCameraPosition(cameraPosition);
        map.moveCamera(cameraUpdate);
        //map.animateCamera(CameraUpdateFactory.newLatLngZoom(lL,20));

    }


    /**
     * Creates a heat map from a weighted list (lonlat, price)
     * @param list Weighted LatLng list (lonlat, price)
     */
    private void addWeightedHeatMap(List<WeightedLatLng> list){
        int[] colors = {
                Color.rgb(0, 0, 225), // Blue
                Color.rgb(255, 0, 0)    // Red
        };

        float[] startPoints = {
                0.2f, 1f
        };

        Gradient gradient = new Gradient(colors, startPoints);

        // Create a heat map tile provider, passing it the latlngs of the police stations.
        mProvider = new HeatmapTileProvider.Builder().weightedData(list).gradient(gradient).build();
        if(mOverlay != null) {
            //Remove old heat map
            mOverlay.clearTileCache();
            mOverlay.remove();
        }
        // Add a tile overlay to the map, using the heat map tile provider.
        mOverlay = map.addTileOverlay(new TileOverlayOptions().tileProvider(mProvider));

    }


    /**
     * Posts the current location to the server along with the device ID and the time
     * @param lon Longitude
     * @param lat Latitude
     * @throws UnsupportedEncodingException
     */
    public void post(Double lon, Double lat) {
        Double[] d = new Double[2];
        d[0] = lon;
        d[1] = lat;
        new UploadFilesTask().execute(d);
    }

    private class UploadFilesTask extends AsyncTask<Double, Integer, Long> {

        protected Long doInBackground(Double... urls) {
            //TODO: add ip address
            Double lon1 = urls[0];
            Double lat1 = urls[1];
            System.out.println("1");

            String imei = Settings.Secure.getString(getApplicationContext().getContentResolver(), Settings.Secure.ANDROID_ID);

            long dateTime = System.currentTimeMillis();

            JSONObject jsonObject = new JSONObject();

            try {
                jsonObject.put("id", imei);
                jsonObject.put("longitude", lon1);
                jsonObject.put("latitude", lat1);
                jsonObject.put("time", dateTime);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            String data = jsonObject.toString();



            //TODO: Encrypt?
            String text = "";
            BufferedReader reader=null;

            // Send data
            try{
                System.out.println("Try data sending success 1");
                // Defined URL  where to send data


                URL url;
                url = new URL("http://35.176.239.74:80/location/update");
                System.out.println("Try data sending success 2");
                // Send POST data request


                URLConnection conn = url.openConnection();
                conn.setDoOutput(true);
                do {
                    System.out.println("Try data sending success 2.2");
                    OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
                    System.out.println("Try data sending success 2.3");
                    wr.write(data);
                    System.out.println("Try data sending success 2.4");
                    wr.flush();
                    System.out.println("Try data sending success 3");
                }while(!cache.isEmpty());



                // Get the server response
                reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line = null;
                System.out.println("Try data sending success 4");

                // Read Server Response
                while((line = reader.readLine()) != null){
                    // Append server response in string
                    sb.append(line + "\n");
                }


                text = sb.toString();
            }catch(Exception ex) {
                cache.push(data);
                System.out.println(ex);
            }finally{
                try{
                    reader.close();
                }catch(Exception ex) {System.out.println(ex);}
            }
            System.out.println("data: " + data);
            System.out.print("Response: " + text);
            return null;
        }



        protected void onPostExecute(Long result) {
            System.out.println("Downloaded " + result + " bytes");
        }
    }

    public ContentResolver getContentResolver(){
        return getApplicationContext().getContentResolver();
    }


    public class Stack{
        private String[] jsonFiles;
        private int index;
        private boolean empty;

        /**
         * Sets up storage of size size
         * @param size size of storage
         */
        public Stack(int size){
            jsonFiles = new String[size];
            index = 0;
            empty = true;
        }

        /**
         * inserts into storage (overwrites the oldest if no room)
         * @param ob
         */
        public void push(String ob){
            if(index == jsonFiles.length){
                index = 0;
            }
            jsonFiles[index] = ob;
            index += 1;
            empty = false;
        }


        /**
         * returns an array containging all the objects
         * @return
         */
        public String[] popAll(){
            String temp[] = jsonFiles.clone();
            jsonFiles = new String[jsonFiles.length];
            empty = true;
            return temp;
        }

        public boolean isEmpty(){
            return empty;
        }
    }

    public void tempGetMap() {
        // http://35.176.239.74:80/price
        // {"longitude":lon, "latitude":,lat}

        Double[] d = new Double[2];
        d[0] = lon;
        d[1] = lat;
        new GetMapData().execute(d);
    }


    public List<WeightedLatLng> getHeatMapData(){
        return heatMapList;
    }


    private class GetMapData extends AsyncTask<Double, Integer, String> {

        protected String doInBackground(Double... urls) {
            //TODO: add ip address
            Double lon1 = urls[0];
            Double lat1 = urls[1];
            System.out.println("1");

            String imei = Settings.Secure.getString(getApplicationContext().getContentResolver(), Settings.Secure.ANDROID_ID);

            long dateTime = System.currentTimeMillis();

            JSONObject jsonObject = new JSONObject();

            try {
                jsonObject.put("id", imei);
                jsonObject.put("longitude", lon1);
                jsonObject.put("latitude", lat1);
                jsonObject.put("time", dateTime);
                jsonObject.put("radius",radius);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            String data = jsonObject.toString();



            //TODO: Encrypt?
            String text = "";
            BufferedReader reader=null;

            // Send data
            try{
                System.out.println("Try data sending success 1");
                // Defined URL  where to send data


//              http://35.176.239.74:80/price/map
//              {"longitude":50.866, "latitude":0.115, "radius":1000, "id":"99a3d03f8c51435a", "time":1511260592907}
                URL url;
                url = new URL("http://35.176.239.74:80/price/map");
                System.out.println("Try data sending success 2");
                // Send POST data request


                URLConnection conn = url.openConnection();
                conn.setDoOutput(true);
                do {
                    System.out.println("Try data sending success 2.2");
                    OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
                    System.out.println("Try data sending success 2.3");
                    wr.write(data);
                    System.out.println("Try data sending success 2.4");
                    wr.flush();
                    System.out.println("Try data sending success 3");
                }while(!cache.isEmpty());



                // Get the server response
                reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line = null;
                System.out.println("Try data sending success 4");

                // Read Server Response
                while((line = reader.readLine()) != null){
                    // Append server response in string
                    sb.append(line + "\n");
                }


                text = sb.toString();
            }catch(Exception ex) {
                cache.push(data);
                System.out.println(ex);
            }finally{
                try{
                    reader.close();
                }catch(Exception ex) {System.out.println(ex);}
            }
            System.out.println("data: " + data);
            System.out.print("Response: " + text);
            text = text.replace("{\"error\":0,\"message\":\"Success\",\"map\":[","");

            text = removeLinks(text);
            return text;
        }


        protected void onPostExecute(String result) {
            heatMapList = new ArrayList<WeightedLatLng>();
            System.out.println("PriceMap: " + result);
            String[] results = result.split("[}],[{]");
            if(results.length > 1) {
                for (int i = 0; i < results.length; i++) {
                    //heatMapList.add()
                    String[] furtherDetail = results[i].split(",");
                    if (furtherDetail.length > 3) {
                        String price = furtherDetail[1];
                        price = price.replace("price:", "");
                        String latitude = furtherDetail[11];
                        latitude = latitude.replace("latitude:", "");
                        String longitude = furtherDetail[12];
                        longitude = longitude.replace("longitude:", "");
                        longitude = longitude.replace("}", "");

                        heatMapList.add(new WeightedLatLng(new LatLng(Double.parseDouble(longitude), Double.parseDouble(latitude)), Integer.parseInt(price)));

                    }
                }
                addWeightedHeatMap(heatMapList);
            }
        }
    }


    public String removeLinks(String text){
        text = text.replace("],\"links\":","*");
        text = text.replace(",\"links\":","*");
        int spaceIndex = text.indexOf("*");
        if (spaceIndex != -1)
        {
            text = text.substring(0, spaceIndex);
        }
        text = text.replace("\"","");
        return text;
    }

    public void getPostcode(String pobox){
        new GetPostcodeData().execute(pobox);
    }

    private class GetPostcodeData extends AsyncTask<String, Integer, String> {

        protected String doInBackground(String... urls) {
            //TODO: add ip address

            String imei = Settings.Secure.getString(getApplicationContext().getContentResolver(), Settings.Secure.ANDROID_ID);

            long dateTime = System.currentTimeMillis();

            JSONObject jsonObject = new JSONObject();
            try {
                jsonObject.put("id", imei);
                jsonObject.put("postcode", urls[0]);
                jsonObject.put("time", dateTime);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            String data = jsonObject.toString();



            //TODO: Encrypt?
            String text = "";
            BufferedReader reader=null;

            // Send data
            try{
                System.out.println("Try data sending success 1");
                // Defined URL  where to send data


//              http://35.176.239.74:80/price/map
//              {"longitude":50.866, "latitude":0.115, "radius":1000, "id":"99a3d03f8c51435a", "time":1511260592907}
                URL url;
                url = new URL("http://35.176.239.74:80/postcode/reverse");
//                URL url = new URL("http://35.177.43.204:80/location/update");
                System.out.println("Try data sending success 2");
                // Send POST data request


                URLConnection conn = url.openConnection();
                conn.setDoOutput(true);
                do {
                    System.out.println("Try data sending success 2.2");
                    OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
                    System.out.println("Try data sending success 2.3");
                    wr.write(data);
                    System.out.println("Try data sending success 2.4");
                    wr.flush();
                    System.out.println("Try data sending success 3");
                    System.out.println("data: " + data);

                }while(!cache.isEmpty());



                // Get the server response
                reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line = null;
                System.out.println("Try data sending success 4");

                // Read Server Response
                while((line = reader.readLine()) != null){
                    // Append server response in string
                    sb.append(line + "\n");
                }


                text = sb.toString();
            }catch(Exception ex) {
                cache.push(data);
                System.out.println(ex);
            }finally{
                try{
                    reader.close();
                }catch(Exception ex) {System.out.println(ex);}
            }
            System.out.println("data: " + data);
            System.out.print("Response: " + text);

            text = text.replace("{\"error\":0,\"message\":\"Success\",\"","");
            text= removeLinks(text);
            return text;
        }


        protected void onPostExecute(String result) {
            System.out.println("result: " +result);
            String[] results = result.split(",");
            results[0] = results[0].replace("longitude:","");
            System.out.println("lon--: "+results[0]);
            lon = Double.parseDouble(results[0]);
            results[1] = results[1].replace("latitude:","");
            System.out.println(results[1]);
            lat = Double.parseDouble(results[1]);
            showOnMap();
            tempGetMap();
        }
    }

    public void getPrice(){
        Double[] d = new Double[2];
        d[0] = lon;
        d[1] = lat;
        new GetPriceData().execute(d);
    }

    private class GetPriceData extends AsyncTask<Double, Integer, String> {

        protected String doInBackground(Double... urls) {
            //TODO: add ip address
            Double lon1 = urls[0];
            Double lat1 = urls[1];
            String imei = Settings.Secure.getString(getApplicationContext().getContentResolver(), Settings.Secure.ANDROID_ID);

            long dateTime = System.currentTimeMillis();

            JSONObject jsonObject = new JSONObject();
            try {
                jsonObject.put("id", imei);
                jsonObject.put("longitude", lon1);
                jsonObject.put("latitude", lat1);
                jsonObject.put("time", dateTime);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            String data = jsonObject.toString();

            //TODO: Encrypt?
            String text = "";
            BufferedReader reader=null;

            // Send data
            try{
                System.out.println("Try data sending success 1");

                URL url;
                url = new URL("http://35.176.239.74:80/price");
                System.out.println("Try data sending success 2");
                // Send POST data request


                URLConnection conn = url.openConnection();
                conn.setDoOutput(true);
                do {
                    System.out.println("Try data sending success 2.2");
                    OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
                    System.out.println("Try data sending success 2.3");
                    wr.write(data);
                    System.out.println("Try data sending success 2.4");
                    wr.flush();
                    System.out.println("Try data sending success 3");
                }while(!cache.isEmpty());



                // Get the server response
                reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line = null;
                System.out.println("Try data sending success 4");

                // Read Server Response
                while((line = reader.readLine()) != null){
                    // Append server response in string
                    sb.append(line + "\n");
                }


                text = sb.toString();
            }catch(Exception ex) {
                cache.push(data);
                System.out.println(ex);
            }finally{
                try{
                    reader.close();
                }catch(Exception ex) {System.out.println(ex);}
            }
            System.out.println("data: " + data);
            System.out.print("Response: " + text);

            text = text.replace("{\"error\":0,\"message\":\"Success\",\"price\":","");
            text= removeLinks(text);

            boolean isFound = text.indexOf("{error:1,message:Bad request") == -1?  false : true; //true
            System.out.println(isFound);
            if(isFound)
                text = "No Data";

            return text;
        }


        protected void onPostExecute(String result) {
            System.out.println("result: " +result);
            String tempS = postcode + ": ";
            if(result.equals("No Data"))
                tempS = tempS + result;
            else
                tempS = tempS + "£"+result;
            tempS = tempS.replace("\n","");
            priceView.setText(tempS);//£3700.00"); //set priceview to hold postcode and price
            priceView.setVisibility(View.VISIBLE); // show priceview
        }
    }


    public void getPostcodeFromLonLat(){
        Double[] d = new Double[2];
        d[0] = lon;
        d[1] = lat;
        new getPostcodeLL().execute(d);
    }

    private class getPostcodeLL extends AsyncTask<Double, Integer, String> {

        protected String doInBackground(Double... urls) {
            //TODO: add ip address
            Double lon1 = urls[0];
            Double lat1 = urls[1];
            System.out.println("1");

            String imei = Settings.Secure.getString(getApplicationContext().getContentResolver(), Settings.Secure.ANDROID_ID);

            long dateTime = System.currentTimeMillis();

            JSONObject jsonObject = new JSONObject();

            try {
                jsonObject.put("id", imei);
                jsonObject.put("longitude", lon1);
                jsonObject.put("latitude", lat1);
                jsonObject.put("time", dateTime);
            } catch (JSONException e) {
                e.printStackTrace();
            }
            String data = jsonObject.toString();



            //TODO: Encrypt?
            String text = "";
            BufferedReader reader=null;

            // Send data
            try{
                System.out.println("Try data sending success 1");
                // Defined URL  where to send data


//              http://35.176.239.74:80/price/map
//              {"longitude":50.866, "latitude":0.115, "radius":1000, "id":"99a3d03f8c51435a", "time":1511260592907}
                URL url;
                url = new URL("http://35.176.239.74:80/postcode");
//                URL url = new URL("http://35.177.43.204:80/location/update");
                System.out.println("Try data sending success 2");
                // Send POST data request


                URLConnection conn = url.openConnection();
                conn.setDoOutput(true);
                do {
                    System.out.println("Try data sending success 2.2");
                    OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
                    System.out.println("Try data sending success 2.3");
                    wr.write(data);
                    System.out.println("Try data sending success 2.4");
                    wr.flush();
                    System.out.println("Try data sending success 3");
                }while(!cache.isEmpty());



                // Get the server response
                reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line = null;
                System.out.println("Try data sending success 4");

                // Read Server Response
                while((line = reader.readLine()) != null){
                    // Append server response in string
                    sb.append(line + "\n");
                }


                text = sb.toString();
            }catch(Exception ex) {
                cache.push(data);
                System.out.println(ex);
            }finally{
                try{
                    reader.close();
                }catch(Exception ex) {System.out.println(ex);}
            }
            System.out.println("data: " + data);
            System.out.print("Response: " + text);

            text = text.replace("{\"error\":0,\"message\":\"Success\",\"postcode\":\"","");
            text= removeLinks(text);

            return text;
        }


        protected void onPostExecute(String result) {
                System.out.println(result);
                postcode = result;
        }
    }

    public double[] getLonLat(){
        return new double[]{lon, lat};
    }

    public void setLon(double lon){this.lon = lon;}
    public void setLat(double lat){this.lat = lat;}


    public class MyLocationListener implements android.location.LocationListener {
        public void onLocationChanged(Location location) {
            if(autoLocate) {
                setLon(location.getLongitude());
                setLat(location.getLatitude());
                getPostcodeFromLonLat();
                tempGetMap();
                showOnMap();
            }
        }

        @Override
        public void onStatusChanged(String s, int i, Bundle bundle) {

        }
        @Override
        public void onProviderEnabled(String s) {

        }
        @Override
        public void onProviderDisabled(String s) {

        }
    };
}
