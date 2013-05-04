/*
This file contains TicTacToe.ActionTable, a class that figures out and stores
the correct move to make for any given Tic Tac Toe board state.
*/

var TicTacToe = TicTacToe || {};

var USER_PLAYER = 1;
var COMPUTER_PLAYER = 2;
var MIN_PLAYER = USER_PLAYER;
var MAX_PLAYER = COMPUTER_PLAYER;

TicTacToe.ActionTable = function() {
    this.table = {};
}

TicTacToe.ActionTable.prototype.set_action_and_payoff = function(game_board, action, payoff) {
    return this.table[game_board.toString()] = {action: action, payoff: payoff};
}

TicTacToe.ActionTable.prototype.get_action = function(game_board) {
    return this.table[game_board.toString()]['action'];
}

TicTacToe.ActionTable.prototype.get_payoff = function(game_board) {
    return this.table[game_board.toString()]['payoff'];
}

TicTacToe.ActionTable.prototype.has_entry_for_game_board = function(game_board) {
    return this.table[game_board.toString()] != undefined;
}

TicTacToe.ActionTable.prototype.populate = function(game_board, active_player, inactive_player) {
    // Recursively explore the possible game boards, starting at the state game_board
    // fill in the TicTacToe.ActionTable instance action_table with the action we should take
    // given a specific game_board.
    //
    // The payoff for MAX_PLAYER winning is 1, MIN_PLAYER is -1, and a draw is 0
    //
    // In this game, the MAX_PLAYER is the computer, who we are playing as, and the
    // MIN_PLAYER is the user, who we wish to minimize the payoff to.
    
    // first check if we have already evaluated this game board
    if (this.has_entry_for_game_board(game_board)) {
        // already have this board in the table, no need to evaluate it again
        return this.get_payoff(game_board);
    }
    
    // second, check if we have a draw
    if (game_board.is_draw()) {
        return 0;
    }
    
    // third, determine if we can win in one move
    for (var position = 0; position < game_board.data.length; position++) {
        if (game_board.data[position] == 0) { // found a free position on the board
            // see what happens when we take this position
            game_board.data[position] = active_player;
            var winner = game_board.player_has_won();
            game_board.data[position] = 0;
            
            if (winner == active_player) {
                if (active_player == MIN_PLAYER) {
                    return -1;
                } else {
                    // this is the max player
                    this.set_action_and_payoff(game_board, position, 1);
                    return 1;
                } 
            }
        }
    }
    
    // since we can't win in one move and it's not yet a draw, figure out what moves we can make
    // and their payoffs
    var payoff_position_pairs = [];
    for (var position = 0; position < game_board.data.length; position++) {
        if (game_board.data[position] == 0) {
            game_board.data[position] = active_player;
            // reverse the players since it is now the other player's turn
            var payoff = this.populate(game_board, inactive_player, active_player);
            game_board.data[position] = 0;
            payoff_position_pairs.push({'payoff': payoff, 'action': position});
        }
    }
    
    // go through each payoff and choose either the minimum or maximum depending on
    // which player we are
    var payoff;
    if (active_player == MIN_PLAYER) {
        var min = _.min(payoff_position_pairs, function(e) { return e['payoff']; });
        payoff = min['payoff'];
    } else {
        // max player is active
        var max = _.max(payoff_position_pairs, function(e) { return e['payoff']; });
        payoff = max['payoff'];
        
        var action = max['action'];
        this.set_action_and_payoff(game_board, action, payoff); 
    }
    return payoff;
}
