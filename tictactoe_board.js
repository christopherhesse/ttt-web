/*
This file contains TicTacToe.Board, a class that stores the state of a Tic Tac
Toe board and has some handy functions to check if anybody won the game.
*/

var TicTacToe = TicTacToe || {};

TicTacToe.Board = function(data) {
    if (data == undefined) {
        this.data = [0,0,0,0,0,0,0,0,0];
    } else {
        this.data = data;
    }
}

TicTacToe.Board.prototype.toString = function() {
    return this.data.toString();
}

TicTacToe.Board.prototype.is_draw = function() {
    if (_.indexOf(this.data, 0) == -1) {
        // no 0 value, so no free positions
        return true;
    }
    return false;
}

TicTacToe.Board.prototype.player_has_won = function() {
    // Look at each space on the board, determine if player 1 wins, player 2 wins, or
    // everybody loses, returns 1 for player 1 winning, 2 for player 2, and null if
    // neither has won.
    
    // construct a list of board positions that form a line so we can just check them
    // in order to see if any set has three of the same (non-zero) values
    var position_sets_to_check = [
        // left-right
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        // up-down
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        // diagonal
        [0, 4, 8],
        [2, 4, 6],
    ];
    
    for (var set_number = 0; set_number < position_sets_to_check.length; set_number++) {
        var position_set = position_sets_to_check[set_number];
        
        var values = [];
        for (var i = 0; i < position_set.length; i++) {
            var position = position_set[i];
            values.push(this.data[position]);
        }
        
        if (_.isEqual(values, [1,1,1])) {
            // player 1 wins
            return 1;
        }
        
        if (_.isEqual(values, [2,2,2])) {
            // player 2 wins
            return 2;
        }
    }
    
    return null;
}