import Iter "mo:base/Iter";
import List "mo:base/List";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

actor {
  type Time = Time.Time;
  type List<E> = List.List<E>;

  public type Message = {
    author: Principal;
    content: Text;
    time: Time;
  };

  public type Microblog = actor {
    follow: shared (Principal) -> async ();
    follows: shared query () -> async [Principal];
    post: shared (Text) -> async ();
    posts: shared query (since: Time) -> async [Message];
    timeline: shared () -> async [Message];
  };

  stable var owner: ?Principal = null;
  stable var name: Text = "Anonymous";
  stable var followees : List<Principal> = List.nil();
  stable var messages: List<Message> = List.nil();

  public shared query func get_owner(): async ?Principal {
    owner
  };

  public shared({ caller }) func claim_owner(): async () {
    owner := ?caller;
    name := "Anonymous";
    followees := List.nil();
    messages := List.nil();
  };

  public shared({ caller }) func set_name(newName: Text): async () {
    assert(?caller == owner);

    name := newName;
  };

  public shared query({ caller }) func get_name(): async Text {
    name
  };

  public shared({ caller }) func follow(followee: Principal): async () {
    assert(?caller == owner);

    followees := List.push(followee, followees);
  };

  public shared query func follows(): async [Principal] {
    List.toArray(followees)
  };

  public shared({ caller }) func post(content: Text): async () {
    assert(?caller == owner);

    let time = Time.now();
    messages := List.push({ content; time; author = caller }, messages);
  };

  public shared query func posts(since: Time): async [Message] {
    List.toArray(List.filter<Message>(messages, func ({ time }) = time >= since))
  };

  public shared({ caller }) func timeline(since: Time): async [Message] {
    assert(?caller == owner);
    var messages: List<Message> = List.nil();

    for (followee in Iter.fromList(List.reverse(followees))) {
      let canister: Microblog = actor(Principal.toText(followee));
      let msgs: [Message] = await canister.posts(since);
      messages := List.append<Message>(List.fromArray(msgs), messages);
    };

    List.toArray(messages);
  };
}
