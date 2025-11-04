
export const soundscapeSystem = {
    "binauralBeats": {
      "description": "Binaural beats use two slightly different frequencies in each ear to create a perceived third frequency that influences brainwave activity",
      "categories": [
        {
          "id": "delta",
          "name": "Delta Waves",
          "frequency": "0.5-4 Hz",
          "baseFrequency": 200,
          "beatFrequency": 2,
          "benefits": [
            "Deep sleep",
            "Healing",
            "Pain relief",
            "Deep meditation"
          ],
          "recommendedFor": ["sleep", "recovery", "deepRest"],
          "color": "#4A148C",
          "icon": "🌙",
          "unlockLevel": 1,
          "presets": [
            {
              "id": "delta_deep_sleep",
              "name": "Deep Sleep",
              "baseFrequency": 200,
              "beatFrequency": 1.5,
              "description": "Ultimate relaxation for restorative sleep"
            },
            {
              "id": "delta_healing",
              "name": "Healing Meditation",
              "baseFrequency": 200,
              "beatFrequency": 3,
              "description": "Supports physical and mental recovery"
            }
          ]
        },
        {
          "id": "theta",
          "name": "Theta Waves",
          "frequency": "4-8 Hz",
          "baseFrequency": 200,
          "beatFrequency": 6,
          "benefits": [
            "Deep relaxation",
            "Meditation",
            "Creativity",
            "Intuition",
            "Memory formation"
          ],
          "recommendedFor": ["meditation", "creativity", "learning"],
          "color": "#6A1B9A",
          "icon": "🧘",
          "unlockLevel": 1,
          "presets": [
            {
              "id": "theta_meditation",
              "name": "Deep Meditation",
              "baseFrequency": 200,
              "beatFrequency": 5,
              "description": "Access deep meditative states"
            },
            {
              "id": "theta_creative",
              "name": "Creative Flow",
              "baseFrequency": 200,
              "beatFrequency": 7,
              "description": "Unlock creative insights and intuition"
            },
            {
              "id": "theta_learning",
              "name": "Accelerated Learning",
              "baseFrequency": 200,
              "beatFrequency": 6.5,
              "description": "Optimal state for absorbing information"
            }
          ]
        },
        {
          "id": "alpha",
          "name": "Alpha Waves",
          "frequency": "8-14 Hz",
          "baseFrequency": 200,
          "beatFrequency": 10,
          "benefits": [
            "Relaxed focus",
            "Stress reduction",
            "Positive thinking",
            "Light meditation",
            "Peak learning"
          ],
          "recommendedFor": ["studying", "relaxation", "mindfulness"],
          "color": "#7B1FA2",
          "icon": "🌊",
          "unlockLevel": 1,
          "presets": [
            {
              "id": "alpha_focus",
              "name": "Relaxed Focus",
              "baseFrequency": 200,
              "beatFrequency": 10,
              "description": "Calm alertness for studying or reading"
            },
            {
              "id": "alpha_stress_relief",
              "name": "Stress Relief",
              "baseFrequency": 200,
              "beatFrequency": 9,
              "description": "Reduce anxiety and promote calmness"
            },
            {
              "id": "alpha_visualization",
              "name": "Visualization",
              "baseFrequency": 200,
              "beatFrequency": 11,
              "description": "Perfect for guided imagery and manifestation"
            }
          ]
        },
        {
          "id": "beta",
          "name": "Beta Waves",
          "frequency": "14-30 Hz",
          "baseFrequency": 200,
          "beatFrequency": 20,
          "benefits": [
            "Active thinking",
            "Focus",
            "Problem solving",
            "Energy",
            "Concentration"
          ],
          "recommendedFor": ["work", "problemSolving", "alertness"],
          "color": "#8E24AA",
          "icon": "⚡",
          "unlockLevel": 3,
          "presets": [
            {
              "id": "beta_concentration",
              "name": "Peak Concentration",
              "baseFrequency": 200,
              "beatFrequency": 18,
              "description": "Maximum focus for complex tasks"
            },
            {
              "id": "beta_energy",
              "name": "Mental Energy",
              "baseFrequency": 200,
              "beatFrequency": 22,
              "description": "Combat mental fatigue and boost alertness"
            },
            {
              "id": "beta_problem_solving",
              "name": "Problem Solving",
              "baseFrequency": 200,
              "beatFrequency": 16,
              "description": "Analytical thinking and logic"
            }
          ]
        },
        {
          "id": "gamma",
          "name": "Gamma Waves",
          "frequency": "30-100 Hz",
          "baseFrequency": 200,
          "beatFrequency": 40,
          "benefits": [
            "Peak cognitive performance",
            "High-level information processing",
            "Enhanced perception",
            "Heightened consciousness"
          ],
          "recommendedFor": ["peakPerformance", "deepWork", "insights"],
          "color": "#9C27B0",
          "icon": "🧠",
          "unlockLevel": 10,
          "premium": true,
          "presets": [
            {
              "id": "gamma_peak_performance",
              "name": "Peak Performance",
              "baseFrequency": 200,
              "beatFrequency": 40,
              "description": "Ultimate mental clarity and processing"
            },
            {
              "id": "gamma_transcendence",
              "name": "Transcendental Meditation",
              "baseFrequency": 200,
              "beatFrequency": 40,
              "description": "Access higher states of consciousness"
            }
          ]
        }
      ]
    },
    "ambientSounds": {
      "categories": [
        {
          "id": "water",
          "name": "Water Sounds",
          "icon": "💧",
          "color": "#0288D1",
          "sounds": [
            {
              "id": "rain_light",
              "name": "Light Rain",
              "description": "Gentle rainfall on leaves",
              "audioFile": "/audio/rain_light.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 1,
              "tags": ["calming", "focus", "sleep"]
            },
            {
              "id": "rain_heavy",
              "name": "Heavy Rain",
              "description": "Intense rainstorm with thunder",
              "audioFile": "/audio/rain_heavy.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 1,
              "tags": ["sleep", "relaxation", "masking"]
            },
            {
              "id": "rain_on_tent",
              "name": "Rain on Tent",
              "description": "Cozy rain sounds from inside a tent",
              "audioFile": "/audio/rain_tent.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 5,
              "tags": ["sleep", "cozy", "comfort"]
            },
            {
              "id": "ocean_waves",
              "name": "Ocean Waves",
              "description": "Rhythmic waves on a beach",
              "audioFile": "/audio/ocean_waves.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 1,
              "tags": ["relaxation", "meditation", "sleep"]
            },
            {
              "id": "stream",
              "name": "Babbling Brook",
              "description": "Gentle stream flowing over rocks",
              "audioFile": "/audio/stream.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 3,
              "tags": ["focus", "nature", "calming"]
            },
            {
              "id": "waterfall",
              "name": "Waterfall",
              "description": "Powerful cascading water",
              "audioFile": "/audio/waterfall.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 7,
              "tags": ["energy", "masking", "nature"]
            },
            {
              "id": "underwater",
              "name": "Underwater",
              "description": "Submerged ambient bubbles",
              "audioFile": "/audio/underwater.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 10,
              "premium": true,
              "tags": ["unique", "meditation", "immersive"]
            }
          ]
        },
        {
          "id": "wind",
          "name": "Wind & Air",
          "icon": "🍃",
          "color": "#00796B",
          "sounds": [
            {
              "id": "wind_gentle",
              "name": "Gentle Breeze",
              "description": "Soft wind through grass",
              "audioFile": "/audio/wind_gentle.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 1,
              "tags": ["calming", "nature", "subtle"]
            },
            {
              "id": "wind_strong",
              "name": "Strong Wind",
              "description": "Powerful gusts and whistling",
              "audioFile": "/audio/wind_strong.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 5,
              "tags": ["dramatic", "masking", "energy"]
            },
            {
              "id": "wind_chimes",
              "name": "Wind Chimes",
              "description": "Metallic chimes in the breeze",
              "audioFile": "/audio/wind_chimes.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 3,
              "tags": ["melodic", "peaceful", "meditation"]
            },
            {
              "id": "bamboo_chimes",
              "name": "Bamboo Chimes",
              "description": "Hollow bamboo tones",
              "audioFile": "/audio/bamboo_chimes.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 8,
              "tags": ["zen", "meditation", "asian"]
            }
          ]
        },
        {
          "id": "forest",
          "name": "Forest Ambience",
          "icon": "🌲",
          "color": "#388E3C",
          "sounds": [
            {
              "id": "birds_morning",
              "name": "Morning Birds",
              "description": "Dawn chorus of songbirds",
              "audioFile": "/audio/birds_morning.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 1,
              "tags": ["energizing", "nature", "morning"]
            },
            {
              "id": "forest_night",
              "name": "Night Forest",
              "description": "Crickets and nocturnal sounds",
              "audioFile": "/audio/forest_night.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 1,
              "tags": ["sleep", "nature", "evening"]
            },
            {
              "id": "rustling_leaves",
              "name": "Rustling Leaves",
              "description": "Wind through autumn foliage",
              "audioFile": "/audio/leaves.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 4,
              "tags": ["subtle", "focus", "nature"]
            },
            {
              "id": "owl",
              "name": "Owl Calls",
              "description": "Distant owl hoots in forest",
              "audioFile": "/audio/owl.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 6,
              "tags": ["night", "mysterious", "nature"]
            },
            {
              "id": "rainforest",
              "name": "Rainforest",
              "description": "Exotic birds and insects",
              "audioFile": "/audio/rainforest.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 12,
              "premium": true,
              "tags": ["immersive", "exotic", "rich"]
            }
          ]
        },
        {
          "id": "fire",
          "name": "Fire & Warmth",
          "icon": "🔥",
          "color": "#E64A19",
          "sounds": [
            {
              "id": "fireplace",
              "name": "Crackling Fireplace",
              "description": "Warm hearth with popping logs",
              "audioFile": "/audio/fireplace.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 1,
              "tags": ["cozy", "comfort", "focus"]
            },
            {
              "id": "campfire",
              "name": "Campfire",
              "description": "Outdoor fire with night ambience",
              "audioFile": "/audio/campfire.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 5,
              "tags": ["outdoor", "relaxation", "nostalgia"]
            }
          ]
        },
        {
          "id": "weather",
          "name": "Weather",
          "icon": "⛈️",
          "color": "#5E35B1",
          "sounds": [
            {
              "id": "thunder_distant",
              "name": "Distant Thunder",
              "description": "Far-off rumbling storms",
              "audioFile": "/audio/thunder_distant.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 3,
              "tags": ["dramatic", "sleep", "masking"]
            },
            {
              "id": "thunderstorm",
              "name": "Thunderstorm",
              "description": "Intense storm with close lightning",
              "audioFile": "/audio/thunderstorm.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 6,
              "tags": ["intense", "masking", "dramatic"]
            },
            {
              "id": "snow",
              "name": "Snowfall",
              "description": "Quiet winter snowfall",
              "audioFile": "/audio/snow.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 10,
              "tags": ["quiet", "peaceful", "winter"]
            }
          ]
        },
        {
          "id": "ambient",
          "name": "Ambient Tones",
          "icon": "🎵",
          "color": "#00897B",
          "sounds": [
            {
              "id": "tibetan_bowl",
              "name": "Tibetan Singing Bowl",
              "description": "Resonant metallic tones",
              "audioFile": "/audio/tibetan_bowl.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 5,
              "tags": ["meditation", "spiritual", "healing"]
            },
            {
              "id": "om_chant",
              "name": "Om Chanting",
              "description": "Deep meditative om vibration",
              "audioFile": "/audio/om_chant.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 7,
              "tags": ["meditation", "spiritual", "deep"]
            },
            {
              "id": "space_ambient",
              "name": "Space Ambient",
              "description": "Ethereal cosmic soundscape",
              "audioFile": "/audio/space_ambient.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 10,
              "premium": true,
              "tags": ["immersive", "unique", "expansive"]
            },
            {
              "id": "pink_noise",
              "name": "Pink Noise",
              "description": "Balanced noise for focus",
              "audioFile": "/audio/pink_noise.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 1,
              "tags": ["focus", "masking", "technical"]
            },
            {
              "id": "white_noise",
              "name": "White Noise",
              "description": "Pure static for blocking distractions",
              "audioFile": "/audio/white_noise.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 1,
              "tags": ["masking", "sleep", "technical"]
            },
            {
              "id": "brown_noise",
              "name": "Brown Noise",
              "description": "Deep, bass-heavy noise",
              "audioFile": "/audio/brown_noise.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 3,
              "tags": ["sleep", "deep", "masking"]
            }
          ]
        },
        {
          "id": "cafe",
          "name": "Human Spaces",
          "icon": "☕",
          "color": "#795548",
          "sounds": [
            {
              "id": "coffee_shop",
              "name": "Coffee Shop",
              "description": "Ambient café chatter and espresso machine",
              "audioFile": "/audio/coffee_shop.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 5,
              "tags": ["focus", "social", "productivity"]
            },
            {
              "id": "library",
              "name": "Library",
              "description": "Quiet page turning and whispers",
              "audioFile": "/audio/library.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 7,
              "tags": ["focus", "quiet", "studying"]
            },
            {
              "id": "train",
              "name": "Train Journey",
              "description": "Rhythmic train on tracks",
              "audioFile": "/audio/train.mp3",
              "duration": 600,
              "loopable": true,
              "unlockLevel": 8,
              "tags": ["focus", "rhythmic", "travel"]
            }
          ]
        }
      ]
    },
    "mixer": {
      "maxActiveSounds": 6,
      "maxActiveAmbient": 4,
      "controls": {
        "masterVolume": {
          "default": 70,
          "min": 0,
          "max": 100,
          "step": 1
        },
        "binauralVolume": {
          "default": 60,
          "min": 0,
          "max": 100,
          "step": 1
        },
        "ambientVolume": {
          "default": 50,
          "min": 0,
          "max": 100,
          "step": 1
        },
        "individualSoundVolume": {
          "default": 70,
          "min": 0,
          "max": 100,
          "step": 1
        }
      }
    },
    "presetMixes": [
      {
        "id": "deep_work",
        "name": "Deep Work Session",
        "description": "Peak focus for coding or writing",
        "icon": "💻",
        "category": "productivity",
        "unlockLevel": 1,
        "configuration": {
          "binauralBeat": {
            "category": "beta",
            "presetId": "beta_concentration",
            "volume": 65
          },
          "ambientSounds": [
            {
              "id": "rain_light",
              "volume": 45
            },
            {
              "id": "coffee_shop",
              "volume": 30
            }
          ],
          "masterVolume": 70
        },
        "recommendedDuration": 90,
        "tags": ["focus", "work", "productivity"]
      },
      {
        "id": "meditation_zen",
        "name": "Zen Meditation",
        "description": "Deep mindfulness practice",
        "icon": "🧘‍♀️",
        "category": "meditation",
        "unlockLevel": 1,
        "configuration": {
          "binauralBeat": {
            "category": "theta",
            "presetId": "theta_meditation",
            "volume": 60
          },
          "ambientSounds": [
            {
              "id": "tibetan_bowl",
              "volume": 40
            },
            {
              "id": "stream",
              "volume": 35
            }
          ],
          "masterVolume": 65
        },
        "recommendedDuration": 20,
        "tags": ["meditation", "mindfulness", "spiritual"]
      },
      {
        "id": "sleep_deep",
        "name": "Deep Sleep",
        "description": "Fall asleep fast and stay asleep",
        "icon": "😴",
        "category": "sleep",
        "unlockLevel": 1,
        "configuration": {
          "binauralBeat": {
            "category": "delta",
            "presetId": "delta_deep_sleep",
            "volume": 70
          },
          "ambientSounds": [
            {
              "id": "rain_heavy",
              "volume": 50
            },
            {
              "id": "thunder_distant",
              "volume": 25
            }
          ],
          "masterVolume": 60
        },
        "recommendedDuration": 480,
        "tags": ["sleep", "rest", "recovery"]
      },
      {
        "id": "study_session",
        "name": "Study Session",
        "description": "Absorb and retain information",
        "icon": "📚",
        "category": "learning",
        "unlockLevel": 3,
        "configuration": {
          "binauralBeat": {
            "category": "alpha",
            "presetId": "alpha_focus",
            "volume": 60
          },
          "ambientSounds": [
            {
              "id": "library",
              "volume": 40
            },
            {
              "id": "pink_noise",
              "volume": 30
            }
          ],
          "masterVolume": 65
        },
        "recommendedDuration": 60,
        "tags": ["studying", "learning", "focus"]
      },
      {
        "id": "creative_flow",
        "name": "Creative Flow",
        "description": "Unlock inspiration and ideas",
        "icon": "🎨",
        "category": "creativity",
        "unlockLevel": 5,
        "configuration": {
          "binauralBeat": {
            "category": "theta",
            "presetId": "theta_creative",
            "volume": 65
          },
          "ambientSounds": [
            {
              "id": "ocean_waves",
              "volume": 45
            },
            {
              "id": "wind_chimes",
              "volume": 30
            },
            {
              "id": "birds_morning",
              "volume": 25
            }
          ],
          "masterVolume": 70
        },
        "recommendedDuration": 45,
        "tags": ["creativity", "inspiration", "art"]
      },
      {
        "id": "stress_relief",
        "name": "Stress Relief",
        "description": "Calm anxiety and find peace",
        "icon": "🕊️",
        "category": "wellness",
        "unlockLevel": 1,
        "configuration": {
          "binauralBeat": {
            "category": "alpha",
            "presetId": "alpha_stress_relief",
            "volume": 65
          },
          "ambientSounds": [
            {
              "id": "stream",
              "volume": 50
            },
            {
              "id": "forest_night",
              "volume": 35
            }
          ],
          "masterVolume": 65
        },
        "recommendedDuration": 15,
        "tags": ["relaxation", "stress", "wellness"]
      },
      {
        "id": "energy_boost",
        "name": "Energy Boost",
        "description": "Wake up and get motivated",
        "icon": "⚡",
        "category": "energy",
        "unlockLevel": 5,
        "configuration": {
          "binauralBeat": {
            "category": "beta",
            "presetId": "beta_energy",
            "volume": 70
          },
          "ambientSounds": [
            {
              "id": "waterfall",
              "volume": 50
            },
            {
              "id": "birds_morning",
              "volume": 40
            }
          ],
          "masterVolume": 75
        },
        "recommendedDuration": 10,
        "tags": ["energy", "motivation", "alertness"]
      },
      {
        "id": "cozy_evening",
        "name": "Cozy Evening",
        "description": "Wind down after a long day",
        "icon": "🕯️",
        "category": "relaxation",
        "unlockLevel": 3,
        "configuration": {
          "binauralBeat": {
            "category": "theta",
            "presetId": "theta_meditation",
            "volume": 55
          },
          "ambientSounds": [
            {
              "id": "fireplace",
              "volume": 60
            },
            {
              "id": "rain_on_tent",
              "volume": 40
            }
          ],
          "masterVolume": 65
        },
        "recommendedDuration": 30,
        "tags": ["relaxation", "evening", "cozy"]
      },
      {
        "id": "nature_immersion",
        "name": "Nature Immersion",
        "description": "Escape to the wilderness",
        "icon": "🌿",
        "category": "nature",
        "unlockLevel": 7,
        "configuration": {
          "binauralBeat": {
            "category": "alpha",
            "presetId": "alpha_focus",
            "volume": 50
          },
          "ambientSounds": [
            {
              "id": "rainforest",
              "volume": 55
            },
            {
              "id": "stream",
              "volume": 45
            },
            {
              "id": "birds_morning",
              "volume": 35
            }
          ],
          "masterVolume": 70
        },
        "recommendedDuration": 60,
        "premium": true,
        "tags": ["nature", "immersive", "relaxation"]
      },
      {
        "id": "transcendental",
        "name": "Transcendental State",
        "description": "Reach peak consciousness",
        "icon": "✨",
        "category": "advanced",
        "unlockLevel": 15,
        "configuration": {
          "binauralBeat": {
            "category": "gamma",
            "presetId": "gamma_transcendence",
            "volume": 70
          },
          "ambientSounds": [
            {
              "id": "om_chant",
              "volume": 50
            },
            {
              "id": "tibetan_bowl",
              "volume": 40
            },
            {
              "id": "space_ambient",
              "volume": 30
            }
          ],
          "masterVolume": 70
        },
        "recommendedDuration": 30,
        "premium": true,
        "tags": ["advanced", "spiritual", "peak"]
      }
    ],
    "integration": {
      "questLinking": {
        "enabled": true,
        "description": "Link soundscapes to specific quests",
        "autoSuggest": true,
        "mappings": [
          {
            "questCategory": "Work",
            "suggestedPresets": ["deep_work", "study_session"]
          },
          {
            "questCategory": "Health",
            "suggestedPresets": ["meditation_zen", "stress_relief"]
          },
          {
            "questCategory": "Learning",
            "suggestedPresets": ["study_session", "creative_flow"]
          },
          {
            "questCategory": "Creative",
            "suggestedPresets": ["creative_flow", "nature_immersion"]
          }
        ]
      },
      "pomodoroIntegration": {
        "enabled": true,
        "autoPlayOnStart": true,
        "fadeOutOnBreak": true,
        "switchPresetsOnBreak": {
          "enabled": true,
          "workPreset": "deep_work",
          "breakPreset": "stress_relief"
        }
      },
      "rewards": {
        "unlockSounds": {
          "enabled": true,
          "criteria": [
            {
              "soundId": "rainforest",
              "requirement": "Complete 50 quests",
              "rewardMessage": "Unlocked: Rainforest ambience!"
            },
            {
              "soundId": "space_ambient",
              "requirement": "Reach Level 10",
              "rewardMessage": "Unlocked: Space Ambient!"
            }
          ]
        },
        "unlockPresets": {
          "enabled": true,
          "criteria": [
            {
              "presetId": "transcendental",
              "requirement": "Reach Level 15 + Complete 10 meditation quests",
              "rewardMessage": "Unlocked: Transcendental State preset!"
            }
          ]
        }
      },
      "aiFeatures": {
        "personalizedRecommendations": {
          "enabled": true,
          "description": "AI suggests soundscapes based on time of day, current quest, and user history",
          "factors": [
            "currentQuestDifficulty",
            "timeOfDay",
            "userEnergyLevel",
            "recentCompletionRate",
            "mbtiType"
          ]
        },
        "adaptiveMixing": {
          "enabled": true,
          "description": "AI adjusts volume levels based on ambient noise (if microphone permission granted)",
          "requiresPermission": "microphone"
        }
      }
    },
    "userFeatures": {
      "customMixes": {
        "enabled": true,
        "maxSaved": 10,
        "canShare": true,
        "schema": {
          "id": "string",
          "name": "string",
          "description": "string",
          "icon": "emoji",
          "createdAt": "timestamp",
          "configuration": {
            "binauralBeat": "object | null",
            "ambientSounds": "array",
            "masterVolume": "number"
          },
          "usage": {
            "timesPlayed": "number",
            "totalDuration": "number",
            "linkedQuests": "array"
          }
        }
      },
      "favorites": {
        "enabled": true,
        "quickAccess": true
      },
      "history": {
        "enabled": true,
        "trackUsage": true,
        "analytics": [
          "mostUsedPreset",
          "mostUsedBinauralFrequency",
          "mostUsedAmbientSound",
          "totalListeningTime",
          "favoriteTimeOfDay"
        ]
      },
      "sleepTimer": {
        "enabled": true,
        "options": [10, 15, 30, 45, 60, 90, 120, 180, 240, 480],
        "fadeOut": {
          "enabled": true,
          "duration": 120
        }
      }
    }
  }

    