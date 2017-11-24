package com.vik.csv;

import com.sun.deploy.net.HttpResponse;
import sun.net.www.http.HttpClient;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;


import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Random;


public class CSVReader {

    public static void main(String[] args) {
        update();

    }

    public void readAndInsert(){
        String csvFile = "/Users/viktorkaslik/Desktop/tt.csv";
        BufferedReader br = null;
        String line = "";
        String cvsSplitBy = ",";

        try {

            br = new BufferedReader(new FileReader(csvFile));
            while ((line = br.readLine()) != null) {

                // use comma as separator
                String[] country = line.split(cvsSplitBy);

                insert(Long.parseLong(country[0]),country[1],country[2],country[3],country[4],country[5],country[6],country[7],country[8],country[9]);
                System.out.println(country[0]+country[1]+country[2]+country[3]);//,country[4],country[5],country[6],country[7],country[8],country[9]);

                //System.out.println("Country [code= " + country[4] + " , name=" + country[5] + "]");

            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }


    public static void insert(long price, String date,String postcode, String PAON, String SAON, String street, String locality, String Town, String District, String county){
        try
        {
            // create a mysql database connection
            String myDriver = "org.gjt.mm.mysql.Driver";
            String myUrl = "jdbc:mysql://localhost/temp";
            Class.forName(myDriver);
            Connection conn = DriverManager.getConnection(myUrl, "root", "password");

            // create a sql date object so we can use it in our INSERT statement
            //Calendar calendar = Calendar.getInstance();
            //java.sql.Date startDate = new java.sql.Date();

            // the mysql insert statement

            String query = " insert into pricepaid (price,date,postcode, PAON, SAON, street, locality, Town, District, county)"
                    + " values (?, ?, ?, ?, ?,?, ?, ?, ?, ?)";

            // create the mysql insert preparedstatement
            PreparedStatement preparedStmt = conn.prepareStatement(query);
            preparedStmt.setLong (1, price);
            preparedStmt.setString (2, date);
            preparedStmt.setString (3, postcode);
            preparedStmt.setString (4, PAON);
            preparedStmt.setString (5, SAON);
            preparedStmt.setString (6, street);
            preparedStmt.setString (7, locality);
            preparedStmt.setString (8, Town);
            preparedStmt.setString (9, District);
            preparedStmt.setString (10, county);
//            preparedStmt.setString (1, "Barney");
//            preparedStmt.setString (2, "Rubble");
//            preparedStmt.setDate   (3, startDate);
//            preparedStmt.setBoolean(4, false);
//            preparedStmt.setInt    (5, 5000);

            // execute the preparedstatement
            preparedStmt.execute();

            conn.close();
        }
        catch (Exception e)
        {
            System.err.println("Got an exception!");
            System.err.println(e.getMessage());
        }
    }


    public static void update(){
        try{
            // create a mysql database connection
            String myDriver = "org.gjt.mm.mysql.Driver";
            String myUrl = "jdbc:mysql://localhost/temp";
            Class.forName(myDriver);
            Connection conn = DriverManager.getConnection(myUrl, "root", "password");

            // create a sql date object so we can use it in our INSERT statement
            //Calendar calendar = Calendar.getInstance();
            //java.sql.Date startDate = new java.sql.Date();

            // the mysql insert statement
            for(int i = 1030012; i < 105137; i++) {
                int id = i;
                //String query = "select * from temp.pricepaid where id = 10;";//+ id +";";
                // (price,date,postcode, PAON, SAON, street, locality, Town, District, county)"+ " values (?, ?, ?, ?, ?,?, ?, ?, ?, ?)";


                // execute the preparedstatement
                //Statement stmt = conn.createStatement();
                //connection = database.getConnection();
                PreparedStatement statement = conn.prepareStatement("SELECT * FROM pricepaid where id = " + id);
                ResultSet rs = statement.executeQuery();
                rs.next();
                String ll = rs.getString("lon");
                System.out.println("X = " + id );//+ (ll));
                double amountToAdd = 0.00000000000001;
                if(ll == null) {
                    //System.out.println(11111);
                    String pobox1 = rs.getString("postcode");
                    PreparedStatement statement2 = conn.prepareStatement("SELECT * FROM pricepaid where postcode = '" + pobox1 + "'");
                    ResultSet rs1 = statement2.executeQuery();
                    //rs1.next();
                    //System.out.println(rs1.getString("postcode"));
                    Double[] lonlat = getLonLat(pobox1);
                    if(lonlat != null){
//                    if(pobox1.length() > 1 && !(pobox1.equals("EC3M 7AE") || pobox1.equals("SE18 6NS") || pobox1.equals("E5 9AJ") || pobox1.equals("M3 6DZ") || pobox1.equals("MK42 7LZ"))){
//                        Double[] lonlat = getLonLat(pobox1);
                        double x = 0.0;
                        double y = 0.0;
                        Random rand = new Random();
                        while (rs1.next()) {
                            System.out.println(i);
                            System.out.println(rs1.getString("postcode"));
                            float ra = rand.nextFloat();
                            if (ra < 0.5) {
                                lonlat[0] = lonlat[0] + (amountToAdd * x);
                                x += 1.0;
                            } else {
                                lonlat[1] = lonlat[1] + (amountToAdd * y);
                                y += 1.0;
                            }
                            //System.out.println(rs1.getString("id") + " "+ lonlat[0] + " "+ lonlat[1]);
                            PreparedStatement updateStat = conn.prepareStatement("UPDATE pricepaid SET lon =" + lonlat[0] + ", lat = " + lonlat[1]
                                    + "WHERE id = " + rs1.getString("id"));
                            updateStat.executeUpdate();
                            System.out.println("inserted");
                        }

                    }
                }
            }
            System.out.println("FINNISHED");

            conn.close();
        }
        catch (Exception e)
        {
            System.err.println("Got an exception!");
            System.err.println(e.getMessage());
        }
    }


    public static Double[]  getLonLat(String pobox){
        Double[] re = new Double[2];
        pobox = pobox.replace(" ","");
        try {
            URL url = new URL("http://api.postcodes.io/postcodes/"+pobox);

            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.connect();
            BufferedReader br = new BufferedReader(new InputStreamReader((con.getInputStream())));
            StringBuilder sb = new StringBuilder();
            String output;
            while ((output = br.readLine()) != null) {
//                System.out.println(output);
                sb.append(output);
            }

            String [] tempRes = sb.toString().split(",");
            String[] lonlat = new String[]{tempRes[7], tempRes[8]};
            lonlat[0] = lonlat[0].replace("\"longitude\":","");
            lonlat[1] = lonlat[1].replace("\"latitude\":","");
            //System.out.println(lonlat[0]);
            re[0] = Double.parseDouble(lonlat[0]);
            re[1] = Double.parseDouble(lonlat[1]);


        } catch (MalformedURLException e) {
            System.out.println("2: "+pobox);
            e.printStackTrace();
        } catch (IOException e) {
            return null;
            //System.out.println("1: "+pobox);
            //e.printStackTrace();
        }

        return re;
    }


    public static void fixPostcode(){
        try{
            // create a mysql database connection
            String myDriver = "org.gjt.mm.mysql.Driver";
            String myUrl = "jdbc:mysql://localhost/temp";
            Class.forName(myDriver);
            Connection conn = DriverManager.getConnection(myUrl, "root", "password");


            PreparedStatement statement = conn.prepareStatement("select * from pricepaid where postcode =\"\"");
            ResultSet rs = statement.executeQuery();

            //System.out.println(11111);
//            String pobox1 = rs.getString("postcode");
//            PreparedStatement statement2 = conn.prepareStatement("SELECT * FROM pricepaid where postcode = '" + pobox1 + "'");
//            ResultSet rs1 = statement2.executeQuery();
            //rs1.next();
            //System.out.println(rs1.getString("postcode"));


            while (rs.next()) {
                System.out.println(rs.getInt("id"));
                //System.out.println(rs.getString("postcode"));

                String pobox = getPobox();
                //System.out.println(rs1.getString("id") + " "+ lonlat[0] + " "+ lonlat[1]);
                PreparedStatement updateStat = conn.prepareStatement("UPDATE pricepaid SET postcode =" + pobox + "WHERE id = " + rs.getString("id"));
                updateStat.executeUpdate();
                System.out.println("inserted");
            }




            System.out.println("FINNISHED");

            conn.close();
        }
        catch (Exception e)
        {
            System.err.println("Got an exception!");
            System.err.println(e.getMessage());
        }
    }

    public static Double[]  getPobox(String address){
        Double[] re = new Double[2];
        address = address.replace(" ","%20");
        try {
            URL url = new URL("http://api.postcodes.io/postcodes/"+pobox);

            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.connect();
            BufferedReader br = new BufferedReader(new InputStreamReader((con.getInputStream())));
            StringBuilder sb = new StringBuilder();
            String output;
            while ((output = br.readLine()) != null) {
//                System.out.println(output);
                sb.append(output);
            }

            String [] tempRes = sb.toString().split(",");
            String[] lonlat = new String[]{tempRes[7], tempRes[8]};
            lonlat[0] = lonlat[0].replace("\"longitude\":","");
            lonlat[1] = lonlat[1].replace("\"latitude\":","");
            //System.out.println(lonlat[0]);
            re[0] = Double.parseDouble(lonlat[0]);
            re[1] = Double.parseDouble(lonlat[1]);


        } catch (MalformedURLException e) {
            System.out.println("2: "+pobox);
            e.printStackTrace();
        } catch (IOException e) {
            return null;
            //System.out.println("1: "+pobox);
            //e.printStackTrace();
        }

        return re;
    }
}