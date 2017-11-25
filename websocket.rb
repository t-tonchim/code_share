require 'em-websocket'

connections = []

EM::WebSocket.start({ host: '0.0.0.0', port: 3000 }) do |con|
  con.onopen do
    connections << con
  end

  con.onmessage do |message|
    connections.each { |conn| conn.send(message) }
  end
end
