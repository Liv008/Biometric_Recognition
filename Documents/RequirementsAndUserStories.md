##Requirements for website with biometric identification

###Functional Requirements:
    1.	System allows users to register, log in, delete personal data, change personal data, and log out.
    2.	System able to access web camera.
    3.	System able to carry on a facial recognition from a video from a live web camera 
        using facial recognition system.
    4.	System able to recognize users with as little error margin as possible.
    5.  System contains facial recognition system that is able to recognize a person on the basis of an live video, 
        carry on the face detection, alignment, extraction and matching.
    6.	System able to store secured data about users in database.
    7.	System able to read secured data about users from a database.


###User stories:
* ####New user > registration with biometric > system remembers their data
    -	System opens web camera
    -	Takes 3 pictures, asks user to look straight to camera, right and left
    -	Asks to enter their name, email address, password in case face recognition is impossible
    -	Save data to the database
    -	Log in the user
* ####Registered user > log in > system authenticate them
    -	System opens web camera
    -	Carry on face recognition with live stream video from camera
    -	Check if the database contains data of the user
    -	If user exists in the database, log in
    -	If user is not in the database, return a message
* ####Registered user > change personal information > keep data secure
* ####Authenticated user > log out
    -	End the session
* ####Registered user > delete an account > data removed
