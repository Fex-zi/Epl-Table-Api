const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// path to index.html
const indexPath = path.join(__dirname, '/../views/index.html');

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, '/../')));


app.get('/', async (req, res) => {
  try {
    // Fetch data from the Livescore Football API
    const response = await axios.get('https://livescore-football.p.rapidapi.com/soccer/league-table', {
      params: {
        country_code: 'england',
        league_code: 'premier-league'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': 'livescore-football.p.rapidapi.com'
      }
    });

    // Check if the response contains the expected structure
    if (
      response.data &&
      response.data.data &&
      response.data.data.total &&
      response.data.data.total.length === 20
    ) {
      // Extract team data from the API response
      const teamData = response.data.data.total.map(team => ({
        rank: team.rank,
        team_logo: team.team_logo,
        team_name: team.team_name,
        games_played: team.games_played,
        won: team.won,
        draw: team.draw,
        lost: team.lost,
        goals_for: team.goals_for,
        goals_against: team.goals_against,
        goals_diff: team.goals_diff,
        points: team.points
      }));

      // Read the HTML file
      const htmlFile = require('fs').readFileSync(indexPath, 'utf8');

      // Replace a placeholder in the HTML file with the dynamically generated rows
      const updatedHtml = htmlFile.replace(
        '<!-- LoopThroughTeamData -->',
        teamData.map(team => `
          <tr>
            <td class="mobile-rank">${team.rank}</td>
            <td class="mobile-logo"><img src="${team.team_logo}" alt="${team.team_name}"></td>
            <td class="mobile-team-name">${team.team_name}</td>
            <td class="mobile-games">${team.games_played}</td>
            <td>${team.won}</td>
            <td>${team.draw}</td>
            <td>${team.lost}</td>
            <td>${team.goals_for}</td>
            <td>${team.goals_against}</td>
            <td class="mobile-goals-diff">${team.goals_diff}</td>
            <td class="mobile-points">${team.points}</td>
          </tr>
        `).join('')
      );

      // Send the updated HTML to the client
      res.send(updatedHtml);
    } else {
      // If the response structure is unexpected, send an error response
      res.status(500).send('Internal Server Error: Unexpected API response structure');
    }
  } catch (error) {
    console.error(error);

    // Send an error response to the client
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
