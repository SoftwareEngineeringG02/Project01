package com.example.viktorkaslik.gps1;

/**
 * Created by viktorkaslik on 13/11/2017.
 */

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
