var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 22420);

app.get('/',function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }

    row_data = {};
    row_data.workouts = [];
    for (row in rows) {
      workout = {};

      workout.id      = rows[row].id;
      workout.name    = rows[row].name;
      workout.reps    = rows[row].reps;
      workout.weight  = rows[row].weight;
      workout.date    = rows[row].date;
      workout.lbs     = rows[row].lbs;

      row_data.workouts.push(workout);
    }

    context.results = JSON.stringify(rows);
    context.data = row_data;

    res.render('home', context);
  });
});

app.get('/insert',function(req,res,next){
  var context = {};

  mysql.pool.query("INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)",
      [req.query.name, req.query.reps, req.query.weight,
        req.query.date, req.query.lbs], function(err, result){
        if(err){
          next(err);
          return;
        }

        mysql.pool.query("SELECT * FROM workouts WHERE id=?", [result.insertId], function(err, result){
          if(err){
            next(err);
            return;
          }

          res.send(JSON.stringify(result[0]));
        });
      });
});

app.get('/delete',function(req,res,next){
  var context = {};
  mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Deleted " + result.changedRows + " rows.";
    res.render('home',context);
  });
});

app.get('/edit', function(req, res, next){
  var context = {};

  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }

    context.id = result[0].id;
    context.name = result[0].name;
    context.weight = result[0].weight;
    context.reps = result[0].reps;
    context.date = result[0].date;
    context.lbs = result[0].lbs;

    res.render('edit', context);
  });
});

///safe-update?id=1&name=The+Task&done=false
app.get('/update',function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
          [req.query.name || curVals.name, req.query.reps || curVals.reps, req.query.weight || curVals.weight,
            req.query.date || curVals.date, req.query.lbs || curVals.lbs, req.query.id], function(err, result){
            if(err){
              next(err);
              return;
            }
            mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
              if(err){
                next(err);
                return;
              }

              row_data = {};
              row_data.workouts = [];
              for (row in rows) {
                workout = {};

                workout.id      = rows[row].id;
                workout.name    = rows[row].name;
                workout.reps    = rows[row].reps;
                workout.weight  = rows[row].weight;
                workout.date    = rows[row].date;
                workout.lbs     = rows[row].lbs;

                row_data.workouts.push(workout);
              }

              context.results = JSON.stringify(rows);
              context.data = row_data;

              res.render('home', context);
            });
          });
    }
  });
});

app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
        "id INT PRIMARY KEY AUTO_INCREMENT,"+
        "name VARCHAR(255) NOT NULL,"+
        "reps INT,"+
        "weight INT,"+
        "date VARCHAR(255),"+
        "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    });
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});