# Redis Demo

## Starting Redis and Entering the CLI

If Redis is not already running, start it:

```bash
redis-server
```

In a separate terminal, open the Redis CLI:

```bash
redis-cli
```

You should see a prompt like `127.0.0.1:6379>`. You are now connected and can run the commands below.

---

## Keys and Integers

```redis
# Set a key
SET foo 1

# Increment the value (good for counters)
INCR foo
GET foo

# Retrieve a missing key (returns nil)
GET bar

# Increment by a specific amount
INCRBY foo 100
GET foo

# Expire this key/value pair after 60 seconds (great for caching)
EXPIRE foo 60

# Check if a key exists (returns 1 or 0)
EXISTS foo

GET foo

# Set values for multiple keys at once
MSET bar 42 baz 11

# Get values for multiple keys ((nil) if missing)
MGET bar baz

# Note: Redis keys are case-sensitive
GET FOO
```

---

## Strings

```redis
SET username ryanrosario

# Get a substring (indexed from 0; same as SUBSTR)
GETRANGE username 4 11

APPEND username _teaches_cs143
GET username
STRLEN username
```

---

## Lists

Lists do not need to be defined beforehand.

```redis
LPUSH words man
LPUSH words woman
LPUSH words person
RPUSH words camera
RPUSH words tv

# Get the list length
LLEN words

# Get all elements in range
LRANGE words 0 4

# Pop from either side (can be used as a deque, queue, or stack)
LPOP words
RPOP words
RPOP words
RPOP words
RPOP words
RPOP words   # no error when empty
```

---

## Sets

```redis
# Tropical fruits in smoothie 1
SADD fruits1 coconut pineapple guava avocado

# Tropical fruits in smoothie 2
SADD fruits2 pitaya orange guava pineapple

# Intersection: fruits in both smoothies
SINTER fruits1 fruits2

# Union: all fruits across both smoothies
SUNION fruits1 fruits2

# Store the union in a new key
SUNIONSTORE shopping fruits1 fruits2

# Get all members of a set
SMEMBERS shopping

# Get a random member
SRANDMEMBER shopping
```

---

## Hashes

```redis
# Create a hash (like a dictionary / struct)
HSET professor firstname ryan lastname rosario university ucla

# Get a single field
HGET professor university
```

---

## Cleanup

```redis
# List all keys
KEYS *

# Delete specific keys
DEL foo username counts fruits

# Delete all keys in the current database
FLUSHDB

# Delete all keys in all databases
FLUSHALL
```
