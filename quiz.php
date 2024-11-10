<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Personality Quiz</title>
</head>
<body>
    <h1>Personality Quiz</h1>
    <form action="result.php" method="POST">
        <!-- Question 1 -->
        <p>1. Rate tingkat kepercayaan diri mu!</p>
        <label><input type="radio" name="q1" value="NR4-WB3"> 0%</label><br>
        <label><input type="radio" name="q1" value="WB3-NR3-SB1-JM1"> 25%</label><br>
        <label><input type="radio" name="q1" value="SB3-JM2-BB1-WB1"> 50%</label><br>
        <label><input type="radio" name="q1" value="SB4-BB4-JM3-SR2"> 75%</label><br>
        <label><input type="radio" name="q1" value="SN5-SR5-BB4-JM4-SB3"> 100%</label><br><br>

        <!-- Question 2 -->
        <p>2. Berapa total mantan mu?</p>
        <label><input type="radio" name="q2" value="NR3-WB2-SB1"> 0</label><br>
        <label><input type="radio" name="q2" value="SB3-SN2-NR1-WB1"> 1-3</label><br>
        <label><input type="radio" name="q2" value="SN3-BB2-JM2-SR2"> 4-10</label><br>
        <label><input type="radio" name="q2" value="BB4-SR3-JM3-SN2"> 10+</label><br><br>

        <!-- Question 3 -->
        <p>3. Apakah anda perokok?</p>
        <label><input type="radio" name="q3" value="NR3-WB3-SB2"> Nggak</label><br>
        <label><input type="radio" name="q3" value="SB3-WB2-NR1"> Pasif</label><br>
        <label><input type="radio" name="q3" value="BB4-SR3-SN3-JM3-SB1"> Aktif</label><br>
        <label><input type="radio" name="q3" value="JM4-BB3-SN3-SR3"> Akut</label><br><br>

        <!-- Question 4 -->
        <p>4. Apakah anda peminum alkohol?</p>
        <label><input type="radio" name="q4" value="NR3-WB3-SB2-SN1"> Nggak Pernah</label><br>
        <label><input type="radio" name="q4" value="SB3-SN2-NR1-WB1"> Pernah Aja</label><br>
        <label><input type="radio" name="q4" value="BB3-JM3-SR3-SN2"> Aktif</label><br>
        <label><input type="radio" name="q4" value="JM4-BB3-SR3-SN1"> Akut</label><br><br>

        <!-- Question 5 -->
        <p>5. Pilih salah satu</p>
        <label><input type="radio" name="q5" value="SN4-JM2-BB2"> Baggy Outfit</label><br>
        <label><input type="radio" name="q5" value="WB5-NR2"> Jaket Kupluk</label><br>
        <label><input type="radio" name="q5" value="NR3-WB2-JM1"> Kaos Oblong</label><br>
        <label><input type="radio" name="q5" value="JM5-BB2"> Skinny Jeans</label><br>
        <label><input type="radio" name="q5" value="BB4-SN3-JM2-SR1"> Jaket Kulit</label><br><br>

        <!-- Question 6 -->
        <p>6. Berapa followers Instagram mu?</p>
        <label><input type="radio" name="q6" value="NR3-WB3-JM3-SB2"> Kurang dari 200</label><br>
        <label><input type="radio" name="q6" value="SB4-JM2-NR1-WB1"> 200-900</label><br>
        <label><input type="radio" name="q6" value="BB4-SB3-SN3-JM2"> 900-3000</label><br>
        <label><input type="radio" name="q6" value="SR6-BB2-SN2-SB2"> 3000+</label><br><br>

        <button type="submit">Submit</button>
    </form>
</body>
</html>
