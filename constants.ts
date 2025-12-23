
import { Team } from './types';

export const TEAMS: Team[] = [
  {
    id: 'team1',
    name: 'Himanshu ke Hitman Heroes',
    color: 'bg-blue-600',
    players: [
      { name: 'Himanshu Gupta', isCaptain: true },
      { name: 'Anil Mishra', isCaptain: false },
      { name: 'Jagrit Jaiswal', isCaptain: false },
      { name: 'Paresh Lodha', isCaptain: false },
      { name: 'Payal Jain', isCaptain: false },
      { name: 'Tanisha Maloo', isCaptain: false },
      { name: 'Tejas Mokashi', isCaptain: false },
      { name: 'Vinod Choudhary', isCaptain: false },
      { name: 'Rajendra Parkar', isCaptain: false },
    ],
  },
  {
    id: 'team2',
    name: 'Mohit ke Maharathi',
    color: 'bg-red-600',
    players: [
      { name: 'Mohit Jain', isCaptain: true },
      { name: 'Ankush Amkar', isCaptain: false },
      { name: 'Arvind Kadam', isCaptain: false },
      { name: 'Tanmay Jadhav', isCaptain: false },
      { name: 'Nikita Jain', isCaptain: false },
      { name: 'Nisha Jain', isCaptain: false },
      { name: 'Roshan Deshmukh', isCaptain: false },
      { name: 'Hussain Haji', isCaptain: false },
      { name: 'Shreyas Bhatkar', isCaptain: false },
    ],
  },
  {
    id: 'team3',
    name: 'Akshay ka Action Squad',
    color: 'bg-orange-500',
    players: [
      { name: 'Akshay Khaitan', isCaptain: true },
      { name: 'Hareram Choudhary', isCaptain: false },
      { name: 'Babita Jadhav', isCaptain: false },
      { name: 'Darpan Bhansali', isCaptain: false },
      { name: 'Kishor Patil', isCaptain: false },
      { name: 'Neha Shetty', isCaptain: false },
      { name: 'Praful Dambare', isCaptain: false },
      { name: 'Rohit Visavadia', isCaptain: false },
      { name: 'Dikshita Jain', isCaptain: false },
    ],
  },
  {
    id: 'team4',
    name: 'Santosh ke Super Strikers',
    color: 'bg-purple-600',
    players: [
      { name: 'Santosh Sawant', isCaptain: true },
      { name: 'Jayesh Patil', isCaptain: false },
      { name: 'Nidhi Mundra', isCaptain: false },
      { name: 'Prakash Alhat', isCaptain: false },
      { name: 'Saurabh Mahindroo', isCaptain: false },
      { name: 'Priyanka Hingar', isCaptain: false },
      { name: 'Tanisha Udsaria', isCaptain: false },
      { name: 'Vivek Gosavi', isCaptain: false },
      { name: 'Hardeek Baxi', isCaptain: false },
    ],
  },
];

export const TOURNAMENT_RULES = [
  "Only underarm bowling is permitted.",
  "Matches consist of 5 overs per innings.",
  "At least one female player must be included in the opening playing XI.",
  "A female player must bowl the first over of each innings.",
  "The umpire’s decision is final and binding.",
  "Players must wear appropriate sports shoes.",
  "If the ball hits the top net and is caught → OUT.",
  "If the ball hits the side net → NOT OUT.",
  "Top net + boundary = Six runs.",
  "Side net + boundary = Four runs.",
  "Overthrows are allowed and counted.",
  "No free hit for a no-ball.",
  "A bowler can bowl multiple overs as per captain's decision."
];
