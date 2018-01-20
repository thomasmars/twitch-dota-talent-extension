/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/


// Thresholds for when talents will be showing
const talentThresholds = {
  left: 40,
  right: 43.6,
  top: 87,
  bottom: 92.5,
};


const talents = document.createElement('div');
talents.className = 'talents';
talents.style.top = '87%';
const dialogXposition = talentThresholds.left + ((talentThresholds.right - talentThresholds.left) / 2);
talents.style.left = dialogXposition + '%';

const talentTitle = document.createElement('div');
talentTitle.className = 'talent-header';
talentTitle.innerText = 'Talent tree';
talents.appendChild(talentTitle);

const levelDenominators = ['10', '15', '20', '25'];

const talentLists = document.createElement('div');
talentLists.className = 'talent-lists';
talents.appendChild(talentLists);

function listify(listData, filter, withCircles = false) {
  const filteredList = listData.filter(filter).reverse();
  const listItems = document.createElement('ul');
  listItems.className = 'talent-list';
  filteredList.forEach((talent) => {
    const listItem = document.createElement('li');

    if (withCircles) {
      const circle = document.createElement('div');
      circle.className = 'level-circle';
      listItem.appendChild(circle);
    }

    const value = document.createElement('div');
    value.className = 'level-value';
    value.innerText = talent;
    listItem.appendChild(value);

    listItems.appendChild(listItem);
  });
  talentLists.appendChild(listItems);
  return listItems;
}

document.body.appendChild(talents);

let canTalentsShow = false;

document.addEventListener('mousemove', e => {
  // Not in a game, skip showing talents completely
  if (!canTalentsShow) {
    return;
  }

  const xPercentage = (e.clientX / document.body.clientWidth) * 100;
  const yPercentage = (e.clientY / document.body.clientHeight) * 100;
  const withinXRange = xPercentage <= talentThresholds.right && xPercentage >= talentThresholds.left;
  const withinYRange = yPercentage <= talentThresholds.bottom && yPercentage >= talentThresholds.top;

  if (withinXRange && withinYRange) {
    // TODO: Make a little arrow pointing to talents..
    talents.classList.add('showing');
  }
  else {
    talents.classList.remove('showing');
  }
});

function setTalents(talents) {
  // Clear talent lists.
  talentLists.innerHTML = '';

  // Generate new talent lists.
  const leftList = listify(talents, (t, i) => i % 2 === 1);
  leftList.classList.add('left-list');
  const denominators = listify(levelDenominators, () => true, true);
  denominators.classList.add('level-denominators');
  const rightList = listify(talents, (t, i) => i % 2 === 0);
  rightList.classList.add('right-list');
}

function setTalentsVisibility(visibility) {
  canTalentsShow = visibility;
}


const backend = `https://www.dotailluminate.pro`;
if(window.Twitch.ext) {

  window.Twitch.ext.onAuthorized(function (auth) {

    // Register userId and token with broadcaster
    axios.post(`${backend}/register-viewer`, {
      'userId': auth.clientId,
      'channelId': auth.channelId,
      'token': auth.token,
    }).then(res => {
      if (res.data.success) {
        const gameState = res.data.gameState;
        if (gameState.talents) {
          setTalents(gameState.talents);
        }
        if (gameState.displayingTalents) {
          setTalentsVisibility(gameState.displayingTalents);
        }

      }
    }).catch(err => {
      console.log("registering viewer failed", err);
    })
  });

  window.Twitch.ext.listen("broadcast", function (target, contentType, message) {
    console.log("received broadcast message ??", target, contentType, message);

    const gameState = JSON.parse(message);
    setTalents(gameState.talents);
    setTalentsVisibility(gameState.displayingTalents);
  });
}