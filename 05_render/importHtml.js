const htmlCode = `<html maaa=a>
<head>
    <style>
        #container {
            width: 1000px
            height: 800px;
            display: flex;
            background-color: rgb(255,255,255);
        }
        #container #myid {
            width: 200px;
            height: 300px;
            background-color: rgb(84,80,74);
        }
        #container .c1 {
            flex: 1;
            background-color: rgb(111,138,140);
        }
        #container .c2 {
          width: 300px;
          height: 150px;
          background-color: rgb(157,131,119);
        }
        #container .c3 {
            flex: 1;
            background-color: rgb(168,105,69);
        }
        #container .c4 {
            flex: 5;
            background-color: rgb(159,85,64);
        }
        #container .c5 {
          width: 200px;
          height: 400px;
            background-color: rgb(119,226,203);
        }
        #container .c6 {
          width: 80px;
          height: 500px;
          background-color: rgb(184,204,206);
        }
        #container .c7 {
            flex: 1;
            background-color: rgb(112,156,167);
        }
        #container .c8 {
            flex: 3;
            background-color: rgb(185,135,118);
        }
    </style>
</head>
<body>
    <div id="container">
        <div id="myid"></div>
        <div class="c1"></div>
        <div class="c2"></div>
        <div class="c3"></div>
        <div class="c4"></div>
        <div class="c5"></div>
        <div class="c6"></div>
        <div class="c7"></div>
        <div class="c8"></div>
    </div>
</body>
</html>`;

const htmlCode2 = `<html maaa=a>
<head>
    <style>
        #container {
            width: 1000px
            height: 1000px;
            display: flex;
            background-color: rgb(255,255,255);
            justifyContent: flex-start;
            flexWrap: auto;
        }
        #container .c1 {
          width:210px;
          height:200px;
          background-color: rgb(84,80,74);
        }
        #container .c2 {
          width:210px;
          height:100px;
          background-color: rgb(111,138,140);
        }
        
        #container .c3 {
          width:210px;
          height:300px;
          background-color: rgb(157,131,119);
        }
        #container .c4 {
          width:210px;
          height:150px;
          background-color: rgb(168,105,69);
        }
        #container .c5 {
          width:210px;
          height:200px;
          background-color: rgb(168,105,69);
        }
        #container .c6 {
          width:210px;
          height:200px;
          background-color: rgb(168,105,69);
        }
    </style>
</head>
<body>
    <div id="container">
        <div class="c1"></div>
        <div class="c2"></div>
        <div class="c3"></div>
        <div class="c4"></div>
        <div class="c5"></div>
        <div class="c6"></div>
    </div>
</body>
</html>`;

module.exports = htmlCode;
