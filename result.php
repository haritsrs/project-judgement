<?php
// Initialize an array to keep track of the score for each personality type
$scores = [
    "NR" => 0,  // Nerd
    "WB" => 0,  // Wibu
    "SB" => 0,  // Softboy
    "JM" => 0,  // Jamet
    "SN" => 0,  // Skena
    "BB" => 0,  // Badboy
    "SR" => 0   // Starboy
];

// Loop through each question's answer and add points to the relevant personalities
for ($i = 1; $i <= 6; $i++) {
    if (isset($_POST["q$i"])) {
        // Get the selected answer value for question i
        $answer = $_POST["q$i"];

        // Split the answer by "-" to separate each personality-point pair
        $pairs = explode("-", $answer);

        // Loop through each pair to extract personality type and points
        foreach ($pairs as $pair) {
            // Example pair format: "NR4" or "WB3"
            $personality = substr($pair, 0, 2); // First two characters (e.g., NR, WB)
            $points = intval(substr($pair, 2)); // Remaining characters as integer (e.g., 4, 3)

            // Add points to the corresponding personality type
            if (isset($scores[$personality])) {
                $scores[$personality] += $points;
            }
        }
    }
}

// Determine the personality type with the highest score
$maxPersonality = array_keys($scores, max($scores))[0];

// Display the results
echo "<h1>Quiz Results</h1>";
echo "<p>Your personality type is: <strong>$maxPersonality</strong></p>";

// Display detailed scores for each personality type
echo "<h2>Score Breakdown:</h2>";
echo "<ul>";
foreach ($scores as $type => $score) {
    echo "<li>$type: $score points</li>";
}
echo "</ul>";

// Display a description based on the result
$descriptions = [
    "NR" => "You are a Nerd! Thoughtful, introspective, and passionate about knowledge.",
    "WB" => "You are a Wibu! You have a deep interest in anime and Japanese culture.",
    "SB" => "You are a Softboy! Gentle, caring, and maybe a bit artistic.",
    "JM" => "You are a Jamet! Bold, carefree, and fashion-forward.",
    "SN" => "You are a Skena! Trendy and well-connected in the social scene.",
    "BB" => "You are a Badboy! Confident and charismatic with a rebellious side.",
    "SR" => "You are a Starboy! Classy, stylish, and elegant."
];
echo "<p>" . $descriptions[$maxPersonality] . "</p>";
?>
